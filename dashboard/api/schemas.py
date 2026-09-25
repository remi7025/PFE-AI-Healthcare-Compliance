"""Pydantic schema validation for compliance_dataset.json — blocks bad scores at startup."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ThemeScores(BaseModel):
    data_privacy: float = Field(..., ge=1, le=10)
    clinical_validation: float = Field(..., ge=1, le=10)
    approval_process: float = Field(..., ge=1, le=10)
    transparency: float = Field(..., ge=1, le=10)
    ethics: float = Field(..., ge=1, le=10)
    post_market: float = Field(..., ge=1, le=10)
    liability: float = Field(..., ge=1, le=10)


class Country(BaseModel):
    country: str = Field(..., min_length=1)
    iso_code: str = Field(..., min_length=1)
    region: str = Field(..., min_length=1)
    regulatory_body: str
    data_privacy_law: str
    ai_specific_regulation: str
    medical_device_framework: str
    approval_process: str
    data_governance: str
    clinical_validation: str
    algorithmic_transparency: str
    ethical_framework: str
    post_market_surveillance: str
    liability: str
    key_legislations: list[str]
    maturity_level: str
    year_first_ai_regulation: int
    num_ai_devices_approved: float = Field(..., ge=0)
    themes_scores: ThemeScores
    challenges: str
    notable_developments: str


class Metadata(BaseModel):
    title: str
    version: str
    last_updated: str
    description: str
    themes: list[str] = Field(..., min_length=1)
    sources: list[str]


class GlobalTrend(BaseModel):
    trend: str
    description: str
    adoption_level: str
    year_emerged: int


class KeyReference(BaseModel):
    title: str
    author: str
    year: int
    type: str


class ComplianceDataset(BaseModel):
    metadata: Metadata
    countries: list[Country] = Field(..., min_length=1)
    global_trends: list[GlobalTrend] = []
    key_references: list[KeyReference] = []

    @field_validator("countries")
    @classmethod
    def scores_in_range(cls, countries: list[Country]) -> list[Country]:
        for c in countries:
            for name, val in c.themes_scores.model_dump().items():
                if not (1 <= val <= 10):
                    raise ValueError(f"{c.country}.{name}={val} outside 1–10")
        return countries


def validate_dataset_file(path: Path | str) -> dict[str, Any]:
    path = Path(path)
    raw = json.loads(path.read_text(encoding="utf-8"))
    parsed = ComplianceDataset.model_validate(raw)
    return parsed.model_dump()


def validate_dataset_dict(raw: dict[str, Any]) -> dict[str, Any]:
    return ComplianceDataset.model_validate(raw).model_dump()
