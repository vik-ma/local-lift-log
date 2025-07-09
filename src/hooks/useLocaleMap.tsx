import { useMemo } from "react";
import { LocaleMap } from "../helpers";

export const useLocaleMap = () => {
  const localeMap = useMemo(() => LocaleMap(), []);

  return localeMap;
};
