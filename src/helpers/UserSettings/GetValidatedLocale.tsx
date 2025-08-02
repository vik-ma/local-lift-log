import { LocaleMap } from "../Constants/LocaleMap";

export const GetValidatedLocale = (locale: string) => {
  if (LocaleMap().has(locale)) return locale;

  return Array.from(LocaleMap())[0];
};
