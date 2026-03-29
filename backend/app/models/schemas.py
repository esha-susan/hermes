# app/models/schemas.py

from pydantic import BaseModel
from typing import Optional

class FactSheet(BaseModel):
    product_name:      str
    features:          list[str]
    technical_details: list[str]
    target_audience:   str
    value_proposition: str
    ambiguous_flags:   list[str]

class CampaignOutput(BaseModel):
    blog_post:     Optional[str]       = None
    social_thread: Optional[list[str]] = None
    email_teaser:  Optional[str]       = None

class EditorIssue(BaseModel):
    
    location:   str   
    issue:      str   

class EditorReport(BaseModel):
    approved:        bool
    overall_quality: str        
    issues:          list[EditorIssue]
    feedback_for_copywriter: Optional[str] = None  