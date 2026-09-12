# T1D Evidence Explorer

[![CI](https://github.com/aarusheye/t1d-evidence-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/aarusheye/t1d-evidence-explorer/actions/workflows/ci.yml)

A privacy-preserving React application for exploring **published prospective evidence** about two biologically distinct transitions in type 1 diabetes (T1D):

1. development of persistent multiple islet autoantibodies; and
2. progression from confirmed autoantibodies to clinical T1D.

The output is deliberately named an **evidence-based risk scenario**. It is not a person's predicted probability, a diagnostic tool, or a validated clinical model.

## Why this project is different

- No synthetic training data, fitted artifact, invented intercept, or hand-authored risk coefficient is included.
- Every numerical estimate is stored in a machine-readable [evidence registry](src/data/evidence-registry.json) with a citation, source population, reported 95% confidence interval, horizon, and applicability warning.
- Stage 1 and Stage 2 are separate endpoints with separate eligibility rules.
- Uncertainty is propagated through 10,000 deterministic Monte Carlo draws instead of adding an arbitrary interval.
- Leave-one-information-out analysis shows what happens when HLA, SNP/GRS, family-history, or antibody information is unavailable.
- The engine refuses to extrapolate a Stage 1 number when the profile does not match the published TEDDY population.
- Ancestry and population transportability limitations are visible in every result.

## Evidence currently represented

| Question | Prospective source | Endpoint | Horizon |
|---|---|---|---|
| Development of autoimmunity | Bonifacio et al., TEDDY, PLOS Medicine 2018 | Persistent multiple islet autoantibodies | By age 6 |
| Progression after seroconversion | Ziegler et al., pooled Colorado/Finland/Germany cohorts, JAMA 2013 | Clinical T1D | 10 years after seroconversion |
| Genetic evidence gap for progression | Redondo et al., TrialNet, Diabetes Care 2018 | Clinical T1D association for a 30-SNP GRS | Time-to-event analysis |

The TrialNet GRS association is registered and displayed, but is **not mixed numerically** with a different cohort's absolute-risk anchor. That restraint is intentional: combining incompatible score scales and populations would create false precision.

## Uncertainty method

Reported absolute risks are sampled on the logit scale and hazard ratios on the log scale. Compatible progression modifiers use an explicit proportional-hazards approximation:

```text
scenario risk = 1 - (1 - sampled anchor risk) ^ product(sampled hazard ratios)
```

The 2.5th and 97.5th percentiles form the displayed Monte Carlo interval. When an adjusted scenario uses this synthesis, the interface warns that the exact combined probability was not published or validated by the source authors. The random seed and draw count are shown in the result.

## Run locally

Requires Node.js 22.

```bash
npm ci
npm run dev
```

Verification:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

## Project structure

```text
src/
├── data/evidence-registry.json  # versioned source estimates and metadata
├── model/evidence.ts            # registry lookup and integrity validation
├── model/scenario.ts            # eligibility logic and Monte Carlo synthesis
├── model/scenario.test.ts       # anchors, exclusions, uncertainty, missingness
├── components/wizard/           # stage-aware scenario inputs
└── pages/                       # Home, scenario builder, results, methods
docs/
└── MODEL_CARD.md                # intended use, evidence, validation, limitations
.github/workflows/ci.yml         # lint, tests, typecheck/build
```

## Data access and future validation

TEDDY individual-level data are available through controlled-access NIDDK/dbGaP processes, not as a frictionless public CSV. A defensible next research milestone is an approved analysis using those longitudinal records, with a prespecified protocol, train/validation split by participant, calibration assessment, time-to-event metrics, and subgroup reporting. Until that work is completed, this repository makes no individual prediction or performance claim.

See [MODEL_CARD.md](docs/MODEL_CARD.md) for detailed intended use, evidence populations, transportability constraints, and validation requirements.

## Safety and privacy

- Educational and portfolio use only.
- Not a medical device; not FDA/CE cleared.
- Cannot diagnose, screen, treat, or recommend care.
- All scenario computation runs locally in the browser; inputs are not transmitted.

## License

MIT. See [LICENSE](LICENSE).
