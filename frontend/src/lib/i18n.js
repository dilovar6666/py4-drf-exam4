export const localeFor = (language) => ({ ru: "ru-RU", tj: "tg-TJ", en: "en-US" }[language] || "ru-RU");
export const formatDateTime = (value, language, options = { dateStyle: "medium", timeStyle: "short" }) => new Intl.DateTimeFormat(localeFor(language), options).format(new Date(value));
