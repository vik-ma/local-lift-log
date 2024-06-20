type DefaultDistance = {
  name: string;
  distance: number;
  distance_unit: string;
};

export const DefaultDistances = (isMetric: boolean): DefaultDistance[] => {
  const DEFAULT_DISTANCE_LIST: DefaultDistance[] = [
    {
      name: "5K",
      distance: isMetric ? 5 : 3.1,
      distance_unit: isMetric ? "km" : "mi",
    },
    {
      name: "10K",
      distance: isMetric ? 10 : 6.2,
      distance_unit: isMetric ? "km" : "mi",
    },
    {
      name: "1 Mile",
      distance: isMetric ? 1.6 : 1,
      distance_unit: isMetric ? "km" : "mi",
    },
  ];

  Object.freeze(DEFAULT_DISTANCE_LIST);

  return DEFAULT_DISTANCE_LIST;
};
