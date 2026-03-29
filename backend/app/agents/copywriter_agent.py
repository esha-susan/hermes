import json
from app.services.claude_client import call_claude
from app.utils.prompts import COPYWRITER_SYSTEM, COPYWRITER_USER
from app.models.schemas import FactSheet, CampaignOutput

def run_copywriter_agent(fact_sheet: FactSheet) -> CampaignOutput:
    """
    Takes a validated FactSheet.
    Returns a CampaignOutput with blog, thread, and email.
    """


    fact_sheet_text = f"""
Product Name: {fact_sheet.product_name}
Target Audience: {fact_sheet.target_audience}
Value Proposition: {fact_sheet.value_proposition}

Features:
{chr(10).join(f'- {f}' for f in fact_sheet.features)}

Technical Details:
{chr(10).join(f'- {t}' for t in fact_sheet.technical_details)}

Flagged Ambiguities:
{chr(10).join(f'- {a}' for a in fact_sheet.ambiguous_flags) if fact_sheet.ambiguous_flags else 'None'}
"""

    user_message = COPYWRITER_USER.format(fact_sheet=fact_sheet_text)

    raw_response = call_claude(
        system_prompt=COPYWRITER_SYSTEM,
        user_message=user_message,
        max_tokens=3000  
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

    return CampaignOutput(
        blog_post=data.get('blog_post'),
        social_thread=data.get('social_thread'),
        email_teaser=data.get('email_teaser')
    )