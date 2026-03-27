const NORMALIZE_WHITESPACE = /\s+/g;
const REMOVE_NON_WORD = /[^\p{L}\p{N}\s]/gu;

function normalizePart(input: string | null | undefined): string {
  if (!input) {
    return "";
  }

  return input
    .trim()
    .toLowerCase()
    .replace(REMOVE_NON_WORD, " ")
    .replace(NORMALIZE_WHITESPACE, " ")
    .trim();
}

export function normalizeName(input: string | null | undefined): string {
  return normalizePart(input);
}

export function normalizeCompany(input: string | null | undefined): string {
  return normalizePart(input);
}

export function makeClientIdentityKey(name: string | null | undefined, company: string | null | undefined): string {
  return `${normalizeName(name)}::${normalizeCompany(company)}`;
}

export function makeInsurerIdentityKey(name: string | null | undefined): string {
  return normalizeName(name);
}
