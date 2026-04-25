export function parsePgArray<T>(
  value: string | string[] | undefined,
): string[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .replace(/^\{/, "") // remove leading {
      .replace(/\}$/, "") // remove trailing }
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}
