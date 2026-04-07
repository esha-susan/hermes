from google.api_core.exceptions import ResourceExhausted  # add this
from app.agents.research_agent import run_research_agent
from app.agents.copywriter_agent import run_copywriter_agent, run_copywriter_revision
from app.agents.editor_agent import run_editor_agent
from app.services.supabase_client import supabase

MAX_ITERATIONS = 2

def run_campaign(campaign_id: str, source_text: str):
    try:
        _update_status(campaign_id, "researching")
        
        # wrap Gemini API call
        try:
            fact_sheet = run_research_agent(source_text)
        except ResourceExhausted:
            message = "Google Gemini free-tier quota exceeded. Only 20 requests/day allowed. Please try again later or upgrade your plan."
            supabase.table("campaigns").update({
                "status": "error",
                "error_message": message
            }).eq("id", campaign_id).execute()
            return  # stop campaign gracefully

        supabase.table("campaigns").update({
            "fact_sheet": fact_sheet.model_dump(),
            "status": "writing"
        }).eq("id", campaign_id).execute()

        try:
            campaign_output = run_copywriter_agent(fact_sheet)
        except ResourceExhausted:
            message = "Google Gemini free-tier quota exceeded during content generation."
            supabase.table("campaigns").update({
                "status": "error",
                "error_message": message
            }).eq("id", campaign_id).execute()
            return

        supabase.table("campaigns").update({
            "blog_post":     campaign_output.blog_post,
            "social_thread": campaign_output.social_thread,
            "email_teaser":  campaign_output.email_teaser,
            "status":        "editing"
        }).eq("id", campaign_id).execute()

        iteration = 0
        while iteration < MAX_ITERATIONS:
            _update_status(campaign_id, "editing")

            editor_report = run_editor_agent(fact_sheet, campaign_output)

            supabase.table("campaigns").update({
                "editor_notes":    _report_to_dict(editor_report),
                "iteration_count": iteration + 1
            }).eq("id", campaign_id).execute()

            if editor_report.approved:
                break

            if iteration + 1 >= MAX_ITERATIONS:
                break

            _update_status(campaign_id, "writing")

            campaign_output = run_copywriter_revision(
                fact_sheet=fact_sheet,
                feedback=editor_report.feedback_for_copywriter or "",
                issues=editor_report.issues
            )

            supabase.table("campaigns").update({
                "blog_post":     campaign_output.blog_post,
                "social_thread": campaign_output.social_thread,
                "email_teaser":  campaign_output.email_teaser,
            }).eq("id", campaign_id).execute()

            iteration += 1

        _update_status(campaign_id, "done")

    except Exception as e:
        supabase.table("campaigns").update({
            "status":        "error",
            "error_message": str(e)
        }).eq("id", campaign_id).execute()
        raise


def _update_status(campaign_id: str, status: str):
    supabase.table("campaigns").update(
        {"status": status}
    ).eq("id", campaign_id).execute()


def _report_to_dict(report) -> dict:
    return {
        "approved":        report.approved,
        "overall_quality": report.overall_quality,
        "issues":          [i.model_dump() for i in report.issues],
        "feedback":        report.feedback_for_copywriter
    }