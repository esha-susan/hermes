
import json
from app.services.claude_client import call_claude
from app.utils.prompts import RESEARCH_AGENT_SYSTEM, RESEARCH_AGENT_USER
from app.models.schemas import FactSheet

def run_research_agent(source_text: str) -> FactSheet:
    """
    Takes raw document text.
    Returns a validated FactSheet object.
    Raises ValueError if Claude returns malformed JSON.
    """

    
    user_message = RESEARCH_AGENT_USER.format(source_text=source_text)
    raw_response = call_claude(
        system_prompt=RESEARCH_AGENT_SYSTEM,
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

    return FactSheet(**data)