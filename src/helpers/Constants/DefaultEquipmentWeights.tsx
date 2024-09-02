type DefaultEquipmentWeight = {
  name: string;
  weight: number;
  weight_unit: string;
  is_favorite: number;
};

export const DefaultEquipmentWeights = (
  isMetric: boolean
): DefaultEquipmentWeight[] => {
  const DEFAULT_EQUIPMENT_WEIGHTS: DefaultEquipmentWeight[] = [
    {
      name: "Barbell",
      weight: isMetric ? 20 : 45,
      weight_unit: isMetric ? "kg" : "lbs",
      is_favorite: 0,
    },
    {
      name: "Dumbbell",
      weight: isMetric ? 2 : 5,
      weight_unit: isMetric ? "kg" : "lbs",
      is_favorite: 0,
    },
  ];

  Object.freeze(DEFAULT_EQUIPMENT_WEIGHTS);

  return DEFAULT_EQUIPMENT_WEIGHTS;
};
