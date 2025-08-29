from pydantic import BaseModel, Field
from typing import Dict


class MappingIn(BaseModel):
    file_id: str
    column_map: Dict[str, str] = Field(
        ...,
        json_schema_extra={
            "title": "job_title",
            "salary": "compensation",
            "currency": "currency",
            "country": "country",
            "seniority": "seniority",
            "stack": "stack",
        },
    )
