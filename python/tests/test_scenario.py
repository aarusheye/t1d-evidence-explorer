"""Parity, evidence-integrity, and uncertainty tests for the Python engine."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from t1d_evidence.evidence import evidence_by_id, validate_registry
from t1d_evidence.scenario import build_scenario, simulate


ROOT = Path(__file__).resolve().parents[2]


def parity_cases() -> list[dict[str, object]]:
    path = ROOT / "src" / "data" / "parity-scenarios.json"
    return json.loads(path.read_text(encoding="utf-8"))


def test_registry_is_traceable_and_valid() -> None:
    assert validate_registry() == []


@pytest.mark.parametrize("case", parity_cases(), ids=lambda case: case["id"])
def test_matches_shared_web_parity_contract(case: dict[str, object]) -> None:
    result = build_scenario(case["input"])
    expected = case["expected"]
    assert result["status"] == expected["status"]
    assert result["evidenceIds"] == expected["evidenceIds"]
    if expected["point"] is None:
        assert result["simulation"] is None
    else:
        assert result["simulation"]["point"] == pytest.approx(expected["point"], abs=1e-12)
        assert result["simulation"]["interval95"] == pytest.approx(expected["interval95"], abs=1e-12)


def test_simulation_is_deterministic_bounded_and_contains_point() -> None:
    anchor = evidence_by_id("pooled-multiple-ab-10y")
    first = simulate(anchor, [])
    assert first == simulate(anchor, [])
    low, high = first["interval95"]
    assert 0 <= low < first["point"] < high <= 1


def test_reports_all_requested_missing_information_comparisons() -> None:
    scenario = parity_cases()[3]["input"]
    result = build_scenario(scenario)
    assert [row["field"] for row in result["comparisons"]] == [
        "hla", "geneticScore", "familyHistory", "autoantibodies"
    ]
    antibody = next(row for row in result["comparisons"] if row["field"] == "autoantibodies")
    assert antibody["status"] == "not-estimable"
