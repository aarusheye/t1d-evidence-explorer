"""Command-line interface for reproducible scenario generation."""

from __future__ import annotations

import argparse
import json

from .scenario import build_scenario


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(description="Build a non-clinical T1D evidence scenario")
    command.add_argument("--question", choices=["autoimmunity", "progression"], required=True)
    command.add_argument("--hla", choices=["dr3-dr4-dq8", "dr4-dq8-homozygous", "other", "unknown"], default="unknown")
    command.add_argument("--genetic-score", choices=["teddy-high", "teddy-not-high", "unknown"], default="unknown")
    command.add_argument("--family-history", choices=["none", "first-degree", "unknown"], default="unknown")
    command.add_argument("--autoantibodies", choices=["negative", "single", "multiple", "unknown"], required=True)
    command.add_argument("--seroconversion-age", choices=["under-3", "3-or-older", "unknown"], default="unknown")
    command.add_argument("--sex", choices=["female", "male", "unknown"], default="unknown")
    return command


def main() -> None:
    args = parser().parse_args()
    scenario = {
        "question": args.question,
        "hla": args.hla,
        "geneticScore": args.genetic_score,
        "familyHistory": args.family_history,
        "autoantibodies": args.autoantibodies,
        "seroconversionAge": args.seroconversion_age,
        "sex": args.sex,
    }
    print(json.dumps(build_scenario(scenario), indent=2, sort_keys=True))
