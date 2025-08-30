import { UserSettings } from "../../typings";
import { LocaleMap } from "..";

export const ValidateAndModifyLocale = (userSettings: UserSettings) => {
  const localeMap = LocaleMap();

  if (!localeMap.has(userSettings.locale)) {
    userSettings.locale = localeMap.keys().next().value!;
  }
};
