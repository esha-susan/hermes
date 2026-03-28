from pydantic import BaseModel
from typing import Optional

class CampaignStatus(str):
    PENDING    = "pending"
    RESEARCHING = "researching"
    WRITING    = "writing"
    EDITING    = "editing"
    DONE       = "done"
    ERROR      = "error"

class FactSheet(BaseModel):
    product_name:     str
    features:         list[str]
    technical_details: list[str]
    target_audience:  str
    value_proposition: str
    ambiguous_flags:  list[str]

class CampaignOutput(BaseModel):
    blog_post:     Optional[str] = None
    social_thread: Optional[list[str]] = None
    email_teaser:  Optional[str] = None

class CampaignResponse(BaseModel):
    id:      str
    status:  str
    fact_sheet:  Optional[FactSheet] = None
    output:      Optional[CampaignOutput] = None
    error:       Optional[str] = None