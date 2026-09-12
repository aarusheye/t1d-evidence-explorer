"""Stage-specific scenario selection and deterministic uncertainty propagation."""

from __future__ import annotations

import math
from collections.abc import Callable, Mapping
from typing import Any

from .evidence import evidence_by_id

DRAWS = 10_000
SEED = 20_260_910
MISSING_FIELDS = ("hla", "geneticScore", "familyHistory", "autoantibodies")


def _u32(value: int) -> int:
    return value & 0xFFFFFFFF


def _mulberry32(seed: int) -> Callable[[], float]:
    """Match the web engine's 32-bit PRNG for reproducible cross-language runs."""
    state = _u32(seed)

    def random() -> float:
        nonlocal state
        state = _u32(state + 0x6D2B79F5)
        t = _u32((state ^ (state >> 15)) * (1 | state))
        t = _u32((t + _u32((t ^ (t >> 7)) * (61 | t))) ^ t)
        return _u32(t ^ (t >> 14)) / 4_294_967_296

    return random


def _normal(random: Callable[[], float]) -> float:
    # JavaScript's Number.EPSILON is 2^-52. Using the same floor keeps the
    # Box-Muller transform byte-for-byte reproducible across both engines.
    epsilon = 2.220446049250313e-16
    u = max(epsilon, random())
    v = max(epsilon, random())
    return math.sqrt(-2 * math.log(u)) * math.cos(2 * math.pi * v)


def _logit(probability: float) -> float:
    return math.log(probability / (1 - probability))


def _logistic(value: float) -> float:
    return 1 / (1 + math.exp(-value))


def _sample_risk(evidence: Mapping[str, Any], z_score: float) -> float:
    sd = (_logit(evidence["upper95"]) - _logit(evidence["lower95"])) / (2 * 1.96)
    return _logistic(_logit(evidence["point"]) + z_score * sd)


def _sample_hr(evidence: Mapping[str, Any], z_score: float) -> float:
    sd = (math.log(evidence["upper95"]) - math.log(evidence["lower95"])) / (2 * 1.96)
    return math.exp(math.log(evidence["point"]) + z_score * sd)


def simulate(
    anchor: Mapping[str, Any],
    modifiers: list[Mapping[str, Any]],
    *,
    draws: int = DRAWS,
    seed: int = SEED,
) -> dict[str, Any]:
    """Propagate reported CIs under the documented proportional-hazards approximation."""
    if draws < 100:
        raise ValueError("At least 100 draws are required")
    random = _mulberry32(seed)
    samples: list[float] = []
    for _ in range(draws):
        base_risk = _sample_risk(anchor, _normal(random))
        multiplier = math.prod(_sample_hr(item, _normal(random)) for item in modifiers)
        samples.append(1 - (1 - base_risk) ** multiplier)
    samples.sort()
    point_multiplier = math.prod(item["point"] for item in modifiers)
    point = 1 - (1 - anchor["point"]) ** point_multiplier
    return {
        "point": point,
        "interval95": [samples[math.floor(0.025 * draws)], samples[math.floor(0.975 * draws)]],
        "draws": draws,
        "seed": seed,
    }


def _core(scenario: Mapping[str, str]) -> dict[str, Any]:
    if scenario["question"] == "autoimmunity":
        if scenario["autoantibodies"] != "negative":
            return {"anchor": None, "modifiers": [], "simulation": None, "reason": "Stage 1 requires confirmed antibody-negative status at baseline."}
        if scenario["hla"] not in {"dr3-dr4-dq8", "dr4-dq8-homozygous"}:
            return {"anchor": None, "modifiers": [], "simulation": None, "reason": "TEDDY published this estimate only for DR3/DR4-DQ8 or DR4-DQ8/DR4-DQ8."}
        if scenario["familyHistory"] != "none":
            return {"anchor": None, "modifiers": [], "simulation": None, "reason": "The applicable TEDDY analysis excluded children with a first-degree relative with T1D."}
        evidence_id = {
            "teddy-high": "teddy-mia-grs-high",
            "teddy-not-high": "teddy-mia-grs-not-high",
        }.get(scenario["geneticScore"], "teddy-mia-high-hla-all-grs")
        anchor = evidence_by_id(evidence_id)
        return {"anchor": anchor, "modifiers": [], "simulation": simulate(anchor, []), "reason": None}

    if scenario["question"] != "progression":
        raise ValueError(f"Unknown research question: {scenario['question']}")
    if scenario["autoantibodies"] not in {"single", "multiple"}:
        return {"anchor": None, "modifiers": [], "simulation": None, "reason": "Stage 2 requires confirmed persistent single or multiple islet autoantibodies."}
    anchor = evidence_by_id(
        "pooled-multiple-ab-10y" if scenario["autoantibodies"] == "multiple" else "pooled-single-ab-10y"
    )
    modifiers: list[dict[str, Any]] = []
    if scenario["autoantibodies"] == "multiple":
        if scenario["hla"] == "dr3-dr4-dq8":
            modifiers.append(evidence_by_id("pooled-hla-dr3-dr4-hr"))
        if scenario["seroconversionAge"] == "under-3":
            modifiers.append(evidence_by_id("pooled-young-seroconversion-hr"))
        if scenario["sex"] == "female":
            modifiers.append(evidence_by_id("pooled-female-hr"))
    return {"anchor": anchor, "modifiers": modifiers, "simulation": simulate(anchor, modifiers), "reason": None}


def _without(scenario: Mapping[str, str], field: str) -> dict[str, str]:
    changed = dict(scenario)
    changed[field] = "unknown"
    return changed


def build_scenario(scenario: Mapping[str, str]) -> dict[str, Any]:
    """Build a non-clinical evidence scenario with explicit missing-data sensitivity."""
    required = {"question", "hla", "geneticScore", "familyHistory", "autoantibodies", "seroconversionAge", "sex"}
    missing = required - scenario.keys()
    if missing:
        raise ValueError(f"Missing scenario fields: {', '.join(sorted(missing))}")
    result = _core(scenario)
    comparisons = []
    for field in MISSING_FIELDS:
        alternate = _core(_without(scenario, field))
        estimate = alternate["simulation"]
        original = result["simulation"]
        comparisons.append({
            "field": field,
            "status": "not-estimable" if estimate is None else "unchanged" if original and math.isclose(estimate["point"], original["point"], abs_tol=1e-12) else "estimated",
            "estimate": None if estimate is None else estimate["point"],
            "change": None if estimate is None or original is None else estimate["point"] - original["point"],
        })
    return {
        "question": scenario["question"],
        "status": "estimated" if result["simulation"] else "not-estimable",
        "simulation": result["simulation"],
        "evidenceIds": [item["id"] for item in ([result["anchor"]] if result["anchor"] else []) + result["modifiers"]],
        "reason": result["reason"],
        "comparisons": comparisons,
    }
