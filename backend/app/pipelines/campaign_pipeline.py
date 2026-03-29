
from app.agents.research_agent import run_research_agent
from app.agents.copywriter_agent import run_copywriter_agent
from app.services.supabase_client import supabase

def run_campaign(campaign_id: str, source_text: str):
    try:
        _update_status(campaign_id, "researching")

        fact_sheet = run_research_agent(source_text)

        supabase.table("campaigns").update({
            "fact_sheet": fact_sheet.model_dump(),
            "status": "writing"
        }).eq("id", campaign_id).execute()

        campaign_output = run_copywriter_agent(fact_sheet)

        supabase.table("campaigns").update({
            "blog_post":     campaign_output.blog_post,
            "social_thread": campaign_output.social_thread,
            "email_teaser":  campaign_output.email_teaser,
            "status":        "editing"   
        }).eq("id", campaign_id).execute()


        _update_status(campaign_id, "done")

    except Exception as e:
        supabase.table("campaigns").update({
            "status": "error",
            "error_message": str(e)
        }).eq("id", campaign_id).execute()
        raise

def _update_status(campaign_id: str, status: str):
    supabase.table("campaigns").update(
        {"status": status}
    ).eq("id", campaign_id).execute()