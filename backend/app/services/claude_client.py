import anthropic
from app.config import ANTHROPIC_API_KEY

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def call_claude(system_prompt: str, user_message: str, max_tokens: int = 2000) -> str:
    """
    Single function all agents use to call Claude.
    Returns the text response as a plain string.
    """
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )
    return message.content[0].text