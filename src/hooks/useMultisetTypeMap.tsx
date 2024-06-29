import { useMemo } from "react";

type MultisetTypeMap = {
  [key: number]: {
    text: string;
  };
};

export const useMultisetTypeMap = () => {
  const multisetTypeMap = useMemo(() => {
    const multisetTypeMap: MultisetTypeMap = {
      0: {
        text: "Superset",
      },
      1: {
        text: "Drop Set",
      },
      2: {
        text: "Giant Set",
      },
      3: {
        text: "Pyramid Set",
      },
    };

    return multisetTypeMap;
  }, []);

  const validDropdownTypeKeys: string[] = useMemo(() => {
    return Object.keys(multisetTypeMap);
  }, [multisetTypeMap]);

  return { multisetTypeMap, validDropdownTypeKeys };
};
