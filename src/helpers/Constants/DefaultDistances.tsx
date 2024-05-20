type DefaultDistance = {
  name: string;
  distance: number;
  distance_unit: string;
};

export const DefaultDistances = (isMetric: boolean): DefaultDistance[] => {
  const DEFAULT_DISTANCE_LIST: DefaultDistance[] = [];

  if (isMetric) {
    // Metric Units
    DEFAULT_DISTANCE_LIST.push({
      name: "5 Kilometers",
      distance: 5,
      distance_unit: "km",
    });
    DEFAULT_DISTANCE_LIST.push({
      name: "10 Kilometers",
      distance: 10,
      distance_unit: "km",
    });
  } else {
    // Imperial Units
    DEFAULT_DISTANCE_LIST.push({
      name: "3 Miles",
      distance: 3,
      distance_unit: "mi",
    });
    DEFAULT_DISTANCE_LIST.push({
      name: "6 Miles",
      distance: 6,
      distance_unit: "mi",
    });
  }

  Object.freeze(DEFAULT_DISTANCE_LIST);

  return DEFAULT_DISTANCE_LIST;
};
