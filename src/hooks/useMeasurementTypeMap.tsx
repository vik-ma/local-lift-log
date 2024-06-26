import { useMemo } from "react";

type MeasurementTypeMap = {
  [key: number]: {
    text: string;
  };
};

export const useMeasurementTypeMap = () => {
  const measurementTypeMap = useMemo(() => {
    const measurementTypeMap: MeasurementTypeMap = {
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

    return measurementTypeMap;
  }, []);

  const validDropdownTypeKeys: string[] = useMemo(() => {
    return ["0", "1", "2", "3"];
  }, []);

  return { measurementTypeMap, validDropdownTypeKeys };
};
