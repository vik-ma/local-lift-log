type LocaleMap = {
  label: string;
  code: string;
};

export const LocaleList = (): LocaleMap[] => {
  const localeMapList: LocaleMap[] = [
    { label: "English (Great Britain)", code: "en-GB" },
    { label: "English (United States)", code: "en-US" },
  ];

  Object.freeze(localeMapList);

  return localeMapList;
};
