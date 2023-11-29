from datetime import date
from pydantic import BaseModel, Json
from typing import List


class Campaign(BaseModel):
    campaign_id: str
    campaign_name: str
    start_date: date
    end_date: date
    area: str
    volume: int
    unit_rate: float
    campaign_status: str = "not_started"
    content_links: Json
    campaign_specific_schema: Json
    audit_criteria: List[int]
