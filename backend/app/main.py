
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uuid

from app.services.supabase_client import supabase
from app.services.document_parser import extract_text
from app.pipelines.campaign_pipeline import run_campaign
from app.features.remix import run_remix
from app.features.audience_sim import run_audience_simulation

app = FastAPI(title="Autonomous Content Factory", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Autonomous Content Factory is running"}


@app.post("/api/campaign/start")
async def start_campaign(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Accepts a file upload, creates a campaign record,
    then runs the agent pipeline in the background.

    WHY background_tasks: The pipeline takes 10-30 seconds.
    We don't want the HTTP request to hang — instead we return
    the campaign ID immediately and let the frontend poll for status.
    """

    file_bytes = await file.read()

    try:
        source_text = extract_text(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not source_text.strip():
        raise HTTPException(status_code=400, detail="Document appears to be empty.")

    campaign_id = str(uuid.uuid4())
    supabase.table("campaigns").insert({
        "id": campaign_id,
        "status": "pending",
        "source_text": source_text
    }).execute()

    background_tasks.add_task(run_campaign, campaign_id, source_text)

    return {"id": campaign_id, "status": "pending"}


@app.get("/api/campaign/{campaign_id}")
def get_campaign(campaign_id: str):
    """
    Frontend polls this to check agent progress and get results.
    """
    result = supabase.table("campaigns")\
        .select("*")\
        .eq("id", campaign_id)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return result.data[0]

from app.features.consistency import run_consistency_check, run_autofix


@app.get("/api/campaign/{campaign_id}/consistency")
def get_consistency(campaign_id: str):
   
    try:
        report = run_consistency_check(campaign_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/campaign/{campaign_id}/autofix")
def autofix_campaign(campaign_id: str):
    """
    Automatically fixes consistency conflicts found in the report.
    """
    try:
        result = run_autofix(campaign_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/campaign/{campaign_id}/remix")
def remix_campaign(campaign_id: str, body: dict):
    """
    Transforms blog post into creative alternative formats.
    body should contain: {"mode": "meme"|"story"|"viral_hook"|"minimal"|"all"}
    """
    mode = body.get("mode", "all")
    try:
        result = run_remix(campaign_id, mode)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/campaign/{campaign_id}/reactions")
def get_reactions(campaign_id: str):
    """
    Simulates audience reactions from developer, CEO, and student personas.
    """
    try:
        result = run_audience_simulation(campaign_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))