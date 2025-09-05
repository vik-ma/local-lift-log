type DefaultDistance = {
  name: string;
  distance: number;
  distance_unit: string;
  is_favorite: number;
};

export const GetDefaultDistances = (isMetric: boolean) => {
  const DEFAULT_DISTANCES: DefaultDistance[] = [
    {
      name: "5K",
      distance: isMetric ? 5 : 3.1,
      distance_unit: isMetric ? "km" : "mi",
      is_favorite: 0,
    },
    {
      name: "10K",
      distance: isMetric ? 10 : 6.2,
      distance_unit: isMetric ? "km" : "mi",
      is_favorite: 0,
    },
    {
      name: "1 Mile",
      distance: isMetric ? 1.6 : 1,
      distance_unit: isMetric ? "km" : "mi",
      is_favorite: 0,
    },
  ];

  Object.freeze(DEFAULT_DISTANCES);

  return DEFAULT_DISTANCES;
};
