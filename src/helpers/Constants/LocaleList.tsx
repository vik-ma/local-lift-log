type LocaleMap = {
  label: string;
  code: string;
};

export const LocaleList = (): LocaleMap[] => {
  const LOCALE_MAP: LocaleMap[] = [
    { label: "DD-MM-YYYY", code: "en-GB" },
    { label: "MM-DD-YYYY", code: "en-US" },
  ];

  Object.freeze(LOCALE_MAP);

  return LOCALE_MAP;
};
