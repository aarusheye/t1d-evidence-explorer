# Model Card: T1D Evidence Explorer

## Summary

The T1D Evidence Explorer is **not a trained model**. It is a deterministic literature-synthesis application that maps a narrowly defined scenario to estimates reported by prospective T1D cohorts. Version: `2.1.0-evidence-synthesis`.

## Intended use

- Educational exploration of prospective T1D evidence.
- Demonstration of traceable evidence engineering, uncertainty propagation, missing-data behavior, and safety-conscious product design.
- A reproducible starting point for a future, approved individual-level validation study.

## Out-of-scope and prohibited use

- Individual diagnosis, screening, triage, treatment, eligibility, or medical decision-making.
- Calling the output “your risk,” “your predicted probability,” or a validated prediction.
- Extrapolation to a person who does not match a source population.
- Substituting consumer DNA results or an unweighted SNP count for a paper-specific genetic risk score.

## Distinct endpoints

### Stage 1 — development of islet autoimmunity

- Outcome: persistent multiple islet autoantibodies.
- Horizon: by age 6 years.
- Evidence population: 4,543 TEDDY children followed prospectively from birth in the US, Finland, Germany, and Sweden; HLA DR3/DR4-DQ8 or DR4-DQ8/DR4-DQ8; no first-degree relative with T1D.
- Source: Bonifacio et al., PLOS Medicine (2018), DOI `10.1371/journal.pmed.1002548`.
- Behavior outside the evidence population: no estimate.

### Stage 2 — progression after autoimmunity

- Outcome: clinical T1D after persistent autoantibody seroconversion.
- Horizon: 10 years after seroconversion.
- Evidence population: genetically at-risk children in prospective cohorts from Colorado, Finland, and Germany.
- Source: Ziegler et al., JAMA (2013), DOI `10.1001/jama.2013.6285`.
- Optional modifiers: HLA DR3/DR4-DQ8, seroconversion before age 3, and female sex, only for the multiple-autoantibody analysis in that source.

## Genetic evidence and restraint

Redondo et al. reported that a 30-SNP T1D genetic risk score was associated with progression in 1,244 TrialNet relatives with at least one persistent autoantibody (HR 1.29 per 0.05 score increase; 95% CI 1.06–1.60; DOI `10.2337/dc18-0087`). This coefficient is registered for traceability but not multiplied into the pooled pediatric absolute-risk anchor because the population and score scale differ. The UI reports the estimate as unchanged when this information is removed and explains why.

## Uncertainty

- Absolute-risk estimates: logit-normal approximation fitted to the reported point and 95% CI.
- Hazard ratios: log-normal approximation fitted to the reported point and 95% CI.
- Simulation: 10,000 draws with fixed seed `20260910`.
- Combination rule: `1 - (1 - R)^HR_product`, an explicit proportional-hazards approximation.
- Display: 2.5th and 97.5th percentiles.

This interval represents uncertainty in the evidence synthesis under those distributional assumptions. It is not a confidence interval invented around a user-level prediction and is not an individual prediction interval.

## Missing information

| Field unavailable | Stage 1 behavior | Stage 2 behavior |
|---|---|---|
| Autoantibodies | Not estimable | Not estimable |
| HLA | Not estimable because TEDDY eligibility cannot be confirmed | Applicable modifier omitted; comparison disclosed |
| SNP / GRS | Falls back to TEDDY's HLA-only 5.8% estimate | TrialNet coefficient not cross-multiplied; numerical estimate unchanged with disclosure |
| Family history | Not estimable because TEDDY excluded first-degree relatives | Numerical estimate unchanged; transportability warning retained |

Unknown never means “average,” “healthy,” or zero biological effect.

## Transportability, ancestry, and fairness

- The Stage 1 genetic scores were developed using mainly European-ancestry case-control data; the source authors explicitly warned that they may not suit all populations.
- Multi-country TEDDY recruitment does not demonstrate calibration across every ancestry, socioeconomic context, healthcare system, or geography.
- Stage 2 cohorts enrolled genetically at-risk children and should not be generalized to adults or incidental general-population antibody testing.
- No subgroup calibration, equalized performance, or fairness claim is possible without individual-level external validation.

## Validation status

No individual-level dataset is shipped. The application has not been evaluated for discrimination, calibration, decision-curve utility, subgroup performance, or clinical impact. Source-paper performance is not claimed as application performance.

## Required path to a validated model

1. Obtain authorized longitudinal TEDDY and/or TrialNet data with a prespecified protocol.
2. Define separate time origins and censoring rules for Stage 1 and Stage 2.
3. Split by participant and site; prevent repeated-measure and temporal leakage.
4. Fit and calibrate within development data only.
5. Report time-dependent AUC, calibration-in-the-large, calibration slope, Brier score, and decision curves at fixed horizons.
6. Perform external and ancestry-stratified validation with uncertainty; document missingness and selection bias.
7. Conduct clinical, regulatory, privacy, and human-factors review before any medical use.

## Reproducibility controls

- Machine-readable evidence registry.
- Registry integrity tests for identifiers, ranges, citations, populations, and warnings.
- Exact anchor reproduction tests.
- Eligibility/refusal tests.
- Deterministic simulation and bounds tests.
- Missing-information comparison tests.
- Independent TypeScript and Python implementations reading the same evidence registry.
- Shared parity fixtures that both implementations must reproduce.
- Browser-flow test plus lint, typecheck, JavaScript/Python tests, and production build in CI.
