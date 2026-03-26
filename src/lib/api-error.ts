export function apiError(error: string, details?: Record<string, unknown>) {
  return { error, ...(details ? { details } : {}) };
}

export function validationError(details: Record<string, unknown>) {
  return apiError("Validation failed", { issues: details });
}
