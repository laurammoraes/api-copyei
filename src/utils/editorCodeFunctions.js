export function normalizeCode(code) {
  return code.replace(/\s+/g, " ").trim();
}

export function isCodeIncluded(data, codes) {
  const normalizedData = normalizeCode(data);
  return codes.every((code) => {
    const normalizedCode = normalizeCode(code);
    return normalizedData.includes(normalizedCode);
  });
}
