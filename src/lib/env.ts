export function getKeywordsEverywhereApiKey() {
  const value = process.env.KEYWORDS_EVERYWHERE_API_KEY;
  if (!value) {
    throw new Error("Missing KEYWORDS_EVERYWHERE_API_KEY. Add it to your environment before running research.");
  }
  return value;
}

export function hasKeywordsEverywhereApiKey() {
  return Boolean(process.env.KEYWORDS_EVERYWHERE_API_KEY);
}
