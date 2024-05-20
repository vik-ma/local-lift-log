type DefaultEquipmentWeight = {
  name: string;
  weight: number;
  weight_unit: string;
};

export const DefaultEquipmentWeights = (
  isMetric: boolean
): DefaultEquipmentWeight[] => {
  const DEFAULT_EQUIPMENT_WEIGHTS: DefaultEquipmentWeight[] = [
    {
      name: "Barbell",
      weight: isMetric ? 20 : 45,
      weight_unit: isMetric ? "kg" : "lbs",
    },
    {
      name: "Dumbbell",
      weight: isMetric ? 2 : 5,
      weight_unit: isMetric ? "kg" : "lbs",
    },
  ];

  Object.freeze(DEFAULT_EQUIPMENT_WEIGHTS);

  return DEFAULT_EQUIPMENT_WEIGHTS;
};
