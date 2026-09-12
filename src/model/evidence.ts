import registryJson from '@/data/evidence-registry.json';
import type { EvidenceEstimate } from '@/types';

export const EVIDENCE_REGISTRY = registryJson as EvidenceEstimate[];

export function evidenceById(id: string): EvidenceEstimate {
  const evidence = EVIDENCE_REGISTRY.find((item) => item.id === id);
  if (!evidence) throw new Error(`Unknown evidence id: ${id}`);
  return evidence;
}

export function validateEvidenceRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of EVIDENCE_REGISTRY) {
    if (ids.has(item.id)) errors.push(`Duplicate evidence id: ${item.id}`);
    ids.add(item.id);
    if (!(item.lower95 <= item.point && item.point <= item.upper95)) {
      errors.push(`${item.id}: point estimate is outside its 95% confidence range`);
    }
    if (!item.citation.doi || !item.citation.url) errors.push(`${item.id}: citation is incomplete`);
    if (!item.population || !item.applicabilityWarning) {
      errors.push(`${item.id}: population or applicability warning is missing`);
    }
  }
  return errors;
}
