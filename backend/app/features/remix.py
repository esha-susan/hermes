import json
from app.services.claude_client import call_claude
from app.services.supabase_client import supabase
from app.utils.prompts import REMIX_SYSTEM, REMIX_USER

VALID_MODES = {"meme", "story", "viral_hook", "minimal", "all"}

def run_remix(campaign_id: str, mode: str) -> dict:
  
    if mode not in VALID_MODES:
        raise ValueError(f"Invalid mode '{mode}'. Choose from: {VALID_MODES}")

    result = supabase.table("campaigns").select(
        "blog_post, fact_sheet"
    ).eq("id", campaign_id).execute()

    if not result.data:
        raise ValueError(f"Campaign {campaign_id} not found")

    data = result.data[0]

    if not data.get("blog_post"):
        raise ValueError("Blog post not found. Run the pipeline first.")

    fact_sheet = data["fact_sheet"]

    user_message = REMIX_USER.format(
        blog_post=data["blog_post"],
        product_name=fact_sheet.get("product_name", ""),
        value_proposition=fact_sheet.get("value_proposition", "")
    )

    raw_response = call_claude(
        system_prompt=REMIX_SYSTEM,
        user_message=user_message,
        max_tokens=1500
    )

  
    try:
        remixed = json.loads(raw_response)
    except json.JSONDecodeError:
        cleaned = raw_response.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('```')[1]
            if cleaned.startswith('json'):
                cleaned = cleaned[4:]
        remixed = json.loads(cleaned)

    if mode != "all" and mode in remixed:
        result_data = {mode: remixed[mode]}
    else:
        result_data = remixed

 
    existing = supabase.table("campaigns").select(
        "remixed_content"
    ).eq("id", campaign_id).execute()

    existing_remixes = existing.data[0].get("remixed_content") or {}
    existing_remixes.update(result_data)

    supabase.table("campaigns").update({
        "remixed_content": existing_remixes
    }).eq("id", campaign_id).execute()

    return result_data