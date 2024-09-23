type DefaultEquipmentWeight = {
  name: string;
  weight: number;
  weight_unit: string;
  is_favorite: number;
  is_in_plate_calculator: number;
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
      is_in_plate_calculator: 1,
    },
    {
      name: "Dumbbell",
      weight: isMetric ? 2 : 5,
      weight_unit: isMetric ? "kg" : "lbs",
      is_favorite: 0,
      is_in_plate_calculator: 0,
    },
  ];

  const metricWeights = [1.25, 2.5, 5, 10, 15, 20, 25];
  const imperialWeights = [2.5, 5, 10, 25, 35, 45];

  if (isMetric) {
    for (const weight of metricWeights) {
      const equipmentWeight: DefaultEquipmentWeight = {
        name: `${weight} kg`,
        weight: weight,
        weight_unit: "kg",
        is_favorite: 0,
        is_in_plate_calculator: 1,
      };
      DEFAULT_EQUIPMENT_WEIGHTS.push(equipmentWeight);
    }
  } else {
    for (const weight of imperialWeights) {
      const equipmentWeight: DefaultEquipmentWeight = {
        name: `${weight} lbs`,
        weight: weight,
        weight_unit: "lbs",
        is_favorite: 0,
        is_in_plate_calculator: 1,
      };
      DEFAULT_EQUIPMENT_WEIGHTS.push(equipmentWeight);
    }
  }

  Object.freeze(DEFAULT_EQUIPMENT_WEIGHTS);

  return DEFAULT_EQUIPMENT_WEIGHTS;
};
