/**
 * Unwrap list payloads from ApiResponseDTO: data may be T[] or a Spring Page { content: T[] }.
 */
export function unwrapList(res) {
  if (res == null) return [];
  const raw = res.data !== undefined ? res.data : res;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.content)) return raw.content;
  return [];
}
