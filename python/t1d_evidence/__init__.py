"""Reproducible evidence-synthesis engine for T1D research scenarios."""

from .evidence import load_registry, validate_registry
from .scenario import build_scenario, simulate

__all__ = ["build_scenario", "load_registry", "simulate", "validate_registry"]
__version__ = "2.1.0"
