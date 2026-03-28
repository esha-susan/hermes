
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uuid

from app.services.supabase_client import supabase
from app.services.document_parser import extract_text
from app.pipelines.campaign_pipeline import run_campaign

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