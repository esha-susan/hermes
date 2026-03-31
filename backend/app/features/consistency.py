

import json
from app.services.claude_client import call_claude
from app.services.supabase_client import supabase
from app.utils.prompts import (
    CONSISTENCY_SYSTEM, CONSISTENCY_USER,
    AUTOFIX_SYSTEM, AUTOFIX_USER
)

def run_consistency_check(campaign_id: str) -> dict:
    """
    Fetches campaign content from Supabase,
    runs the consistency audit,
    saves and returns the report.
    """

    result = supabase.table("campaigns").select(
        "fact_sheet, blog_post, social_thread, email_teaser"
    ).eq("id", campaign_id).execute()

    if not result.data:
        raise ValueError(f"Campaign {campaign_id} not found")

    data = result.data[0]

    if not all([data.get("blog_post"), data.get("social_thread"), data.get("email_teaser")]):
        raise ValueError("Campaign content is incomplete. Run the full pipeline first.")

    fact_sheet = data["fact_sheet"]
    social_thread_text = '\n'.join(
        f"Post {i+1}: {post}"
        for i, post in enumerate(data["social_thread"])
    )

    user_message = CONSISTENCY_USER.format(
        product_name=fact_sheet.get("product_name", ""),
        target_audience=fact_sheet.get("target_audience", ""),
        value_proposition=fact_sheet.get("value_proposition", ""),
        features=", ".join(fact_sheet.get("features", [])),
        blog_post=data["blog_post"],
        social_thread=social_thread_text,
        email_teaser=data["email_teaser"]
    )

    raw_response = call_claude(
        system_prompt=CONSISTENCY_SYSTEM,
        user_message=user_message,
        max_tokens=2000
    )

    # Defensive parse
    try:
        report = json.loads(raw_response)
    except json.JSONDecodeError:
        cleaned = raw_response.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('```')[1]
            if cleaned.startswith('json'):
                cleaned = cleaned[4:]
        report = json.loads(cleaned)

    supabase.table("campaigns").update({
        "consistency_report": report
    }).eq("id", campaign_id).execute()

    return report


def run_autofix(campaign_id: str) -> dict:
    """
    Reads the consistency report and automatically fixes conflicts.
    Only called if the user clicks 'Auto-fix' in the UI.
    """

    result = supabase.table("campaigns").select(
        "blog_post, social_thread, email_teaser, consistency_report"
    ).eq("id", campaign_id).execute()

    if not result.data:
        raise ValueError(f"Campaign {campaign_id} not found")

    data = result.data[0]
    report = data.get("consistency_report")

    if not report:
        raise ValueError("Run consistency check first before auto-fixing.")

    conflicts = report.get("conflicts", [])
    if not conflicts:
        return {"message": "No conflicts to fix", "changes": None}

    # Format conflicts for the prompt
    conflicts_text = '\n'.join(
        f"- [{c['severity'].upper()}] {c['dimension']}: {c['description']} | Fix: {c['fix']}"
        for c in conflicts
    )

    social_thread_text = '\n'.join(
        f"Post {i+1}: {post}"
        for i, post in enumerate(data["social_thread"])
    )

    user_message = AUTOFIX_USER.format(
        conflicts=conflicts_text,
        blog_post=data["blog_post"],
        social_thread=social_thread_text,
        email_teaser=data["email_teaser"]
    )

    raw_response = call_claude(
        system_prompt=AUTOFIX_SYSTEM,
        user_message=user_message,
        max_tokens=3000
    )

    try:
        fixed = json.loads(raw_response)
    except json.JSONDecodeError:
        cleaned = raw_response.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('```')[1]
            if cleaned.startswith('json'):
                cleaned = cleaned[4:]
        fixed = json.loads(cleaned)

    updates = {}
    if fixed.get("blog_post"):
        updates["blog_post"] = fixed["blog_post"]
    if fixed.get("social_thread"):
        updates["social_thread"] = fixed["social_thread"]
    if fixed.get("email_teaser"):
        updates["email_teaser"] = fixed["email_teaser"]

    if updates:
        supabase.table("campaigns").update(updates)\
            .eq("id", campaign_id).execute()

    return {"message": "Auto-fix applied", "changes": list(updates.keys())}