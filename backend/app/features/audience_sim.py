import json
from app.services.claude_client import call_claude
from app.services.supabase_client import supabase
from app.utils.prompts import AUDIENCE_SYSTEM, AUDIENCE_USER

def run_audience_simulation(campaign_id: str) -> dict:
    """
    Simulates reactions from three personas:
    developer, CEO, and student.
    """

    result = supabase.table("campaigns").select(
        "blog_post, social_thread, email_teaser, fact_sheet"
    ).eq("id", campaign_id).execute()

    if not result.data:
        raise ValueError(f"Campaign {campaign_id} not found")

    data = result.data[0]

    if not all([data.get("blog_post"), data.get("email_teaser")]):
        raise ValueError("Campaign content incomplete. Run the pipeline first.")

    fact_sheet = data["fact_sheet"]
    social_thread_text = '\n'.join(
        f"Post {i+1}: {post}"
        for i, post in enumerate(data.get("social_thread") or [])
    )

    user_message = AUDIENCE_USER.format(
        blog_post=data["blog_post"],
        email_teaser=data["email_teaser"],
        social_thread=social_thread_text,
        product_name=fact_sheet.get("product_name", ""),
        value_proposition=fact_sheet.get("value_proposition", "")
    )

    raw_response = call_claude(
        system_prompt=AUDIENCE_SYSTEM,
        user_message=user_message,
        max_tokens=1000
    )

    try:
        reactions = json.loads(raw_response)
    except json.JSONDecodeError:
        cleaned = raw_response.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('```')[1]
            if cleaned.startswith('json'):
                cleaned = cleaned[4:]
        reactions = json.loads(cleaned)

    supabase.table("campaigns").update({
        "audience_reactions": reactions
    }).eq("id", campaign_id).execute()

    return reactions