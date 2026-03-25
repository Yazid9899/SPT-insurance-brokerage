export function apiError(error: string, details?: Record<string, unknown>) {
  return { error, ...(details ? { details } : {}) };
}
