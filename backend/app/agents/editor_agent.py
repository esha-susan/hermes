import json
from app.services.claude_client import call_claude
from app.utils.prompts import EDITOR_SYSTEM, EDITOR_USER
from app.models.schemas import FactSheet, CampaignOutput, EditorReport, EditorIssue

def run_editor_agent(
    fact_sheet: FactSheet,
    campaign_output: CampaignOutput
) -> EditorReport:
 
    thread_text = '\n'.join(
        f"Post {i+1}: {post}"
        for i, post in enumerate(campaign_output.social_thread or [])
    )

    user_message = EDITOR_USER.format(
        fact_sheet=f"""
Product: {fact_sheet.product_name}
Audience: {fact_sheet.target_audience}
Value Prop: {fact_sheet.value_proposition}
Features: {', '.join(fact_sheet.features)}
Technical: {', '.join(fact_sheet.technical_details)}
""",
        blog_post=campaign_output.blog_post or "",
        social_thread=thread_text,
        email_teaser=campaign_output.email_teaser or ""
    )

    raw_response = call_claude(
        system_prompt=EDITOR_SYSTEM,
        user_message=user_message,
        max_tokens=1500
    )

    try:
        data = json.loads(raw_response)
    except json.JSONDecodeError:
        cleaned = raw_response.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('```')[1]
            if cleaned.startswith('json'):
                cleaned = cleaned[4:]
        data = json.loads(cleaned)
    issues = [EditorIssue(**issue) for issue in data.get('issues', [])]

    return EditorReport(
        approved=data.get('approved', False),
        overall_quality=data.get('overall_quality', 'needs_work'),
        issues=issues,
        feedback_for_copywriter=data.get('feedback_for_copywriter')
    )