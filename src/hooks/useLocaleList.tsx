import { useMemo } from "react";
import { LocaleList } from "../helpers";

export const useLocaleList = () => {
  const localeList = useMemo(() => LocaleList(), []);

  return localeList;
};
