from dotenv import load_dotenv
import os

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SUPABASE_URL      = os.getenv("SUPABASE_URL")
SUPABASE_KEY      = os.getenv("SUPABASE_KEY")

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY is missing from .env")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is missing from .env")
if not SUPABASE_KEY:
    raise ValueError("SUPABASE_KEY is missing from .env")