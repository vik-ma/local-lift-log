export const LocaleList = () => {
  const LOCALE_MAP = new Map([
    ["en-GB", "DD-MM-YYYY"],
    ["en-US", "MM-DD-YYYY"],
  ]);

  Object.freeze(LOCALE_MAP);

  return LOCALE_MAP;
};
