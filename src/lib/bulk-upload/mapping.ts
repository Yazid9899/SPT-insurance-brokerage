import {
  BULK_UPLOAD_REQUIRED_FIELDS,
  BULK_UPLOAD_TARGET_FIELDS,
  HEADER_ALIASES,
  type BulkUploadTargetField,
  normalizeHeader,
} from "@/lib/bulk-upload/header-aliases";

export type BulkUploadColumnMapping = {
  targetField: BulkUploadTargetField;
  sourceHeader: string;
  sourceColumnIndex: number;
  mappingSource: "auto" | "manual";
};

export type AutoMappingResult = {
  mappings: BulkUploadColumnMapping[];
  unresolvedRequiredFields: BulkUploadTargetField[];
  ambiguities: Record<BulkUploadTargetField, string[]>;
};

function findMatches(headers: string[], aliases: readonly string[]) {
  const normalizedAliases = aliases.map(normalizeHeader);
  const matches: Array<{ header: string; index: number }> = [];

  headers.forEach((header, index) => {
    const normalizedHeader = normalizeHeader(header);
    const isMatch = normalizedAliases.some((alias) => normalizedHeader === alias);
    if (isMatch) {
      matches.push({ header, index });
    }
  });

  return matches;
}

export function autoMapHeaders(headers: string[]): AutoMappingResult {
  const mappings: BulkUploadColumnMapping[] = [];
  const unresolvedRequiredFields: BulkUploadTargetField[] = [];
  const ambiguities: Record<string, string[]> = {};

  BULK_UPLOAD_TARGET_FIELDS.forEach((targetField) => {
    const matches = findMatches(headers, HEADER_ALIASES[targetField]);
    if (matches.length === 1) {
      mappings.push({
        targetField,
        sourceHeader: matches[0].header,
        sourceColumnIndex: matches[0].index,
        mappingSource: "auto",
      });
      return;
    }

    if (matches.length > 1) {
      ambiguities[targetField] = matches.map((m) => m.header);
    }

    if (BULK_UPLOAD_REQUIRED_FIELDS.includes(targetField)) {
      unresolvedRequiredFields.push(targetField);
    }
  });

  return {
    mappings,
    unresolvedRequiredFields,
    ambiguities: ambiguities as Record<BulkUploadTargetField, string[]>,
  };
}

export function applyManualMappings(
  autoMappings: BulkUploadColumnMapping[],
  manualOverrides: Partial<Record<BulkUploadTargetField, { header: string; index: number }>>,
): BulkUploadColumnMapping[] {
  const map = new Map(autoMappings.map((m) => [m.targetField, m]));
  Object.entries(manualOverrides).forEach(([field, override]) => {
    if (!override) {
      return;
    }
    map.set(field as BulkUploadTargetField, {
      targetField: field as BulkUploadTargetField,
      sourceHeader: override.header,
      sourceColumnIndex: override.index,
      mappingSource: "manual",
    });
  });
  return Array.from(map.values());
}

