type DefaultDistance = {
  name: string;
  distance: number;
  distance_unit: string;
};

export const DefaultDistanceList = (isMetric: boolean): DefaultDistance[] => {
  const defaultDistanceList: DefaultDistance[] = [];

  if (isMetric) {
    // Metric Units
    defaultDistanceList.push({
      name: "5 Kilometers",
      distance: 5,
      distance_unit: "km",
    });
    defaultDistanceList.push({
      name: "10 Kilometers",
      distance: 5,
      distance_unit: "km",
    });
  } else {
    // Imperial Units
    defaultDistanceList.push({
      name: "3 Miles",
      distance: 3,
      distance_unit: "mi",
    });
    defaultDistanceList.push({
      name: "6 Miles",
      distance: 6,
      distance_unit: "mi",
    });
  }

  return defaultDistanceList;
};
