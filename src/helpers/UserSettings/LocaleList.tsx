type LocaleMap = {
  label: string;
  code: string;
};

export const LocaleList = (): LocaleMap[] => {
  const localeMapList: LocaleMap[] = [
    { label: "DD-MM-YYYY", code: "en-GB" },
    { label: "MM-DD-YYYY", code: "en-US" },
  ];

  Object.freeze(localeMapList);

  return localeMapList;
};
