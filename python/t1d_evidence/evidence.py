"""Load and validate the same evidence registry consumed by the web app."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def registry_path() -> Path:
    """Return the repository's canonical evidence-registry path."""
    return Path(__file__).resolve().parents[2] / "src" / "data" / "evidence-registry.json"


def load_registry(path: Path | None = None) -> list[dict[str, Any]]:
    """Load evidence records without changing their published values."""
    with (path or registry_path()).open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("Evidence registry must contain a JSON array")
    return data


def evidence_by_id(evidence_id: str) -> dict[str, Any]:
    for record in load_registry():
        if record["id"] == evidence_id:
            return record
    raise KeyError(f"Unknown evidence id: {evidence_id}")


def validate_registry(records: list[dict[str, Any]] | None = None) -> list[str]:
    """Return every traceability error; an empty list means the registry is valid."""
    errors: list[str] = []
    seen: set[str] = set()
    required = {
        "id", "stage", "label", "estimateType", "point", "lower95", "upper95",
        "contrast", "horizon", "population", "sampleSize", "applicabilityWarning", "citation",
    }
    for index, item in enumerate(records or load_registry()):
        missing = sorted(required - item.keys())
        if missing:
            errors.append(f"record {index}: missing {', '.join(missing)}")
            continue
        evidence_id = str(item["id"])
        if evidence_id in seen:
            errors.append(f"duplicate evidence id: {evidence_id}")
        seen.add(evidence_id)
        if not item["lower95"] <= item["point"] <= item["upper95"]:
            errors.append(f"{evidence_id}: point lies outside its 95% CI")
        citation = item["citation"]
        if not citation.get("doi") or not str(citation.get("url", "")).startswith("https://"):
            errors.append(f"{evidence_id}: citation is incomplete")
        if not item["population"] or not item["applicabilityWarning"]:
            errors.append(f"{evidence_id}: population or applicability warning is missing")
    return errors
