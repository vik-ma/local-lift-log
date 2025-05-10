import { DefaultPlateWeights } from "..";

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

  const defaultPlateWeights = DefaultPlateWeights();

  const metricWeights = defaultPlateWeights.metric;
  const imperialWeights = defaultPlateWeights.imperial;

  if (isMetric) {
    for (const weight of metricWeights) {
      const equipmentWeight: DefaultEquipmentWeight = {
        name: `${weight} kg`,
        weight: weight,
        weight_unit: "kg",
        is_favorite: 0,
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
      };
      DEFAULT_EQUIPMENT_WEIGHTS.push(equipmentWeight);
    }
  }

  Object.freeze(DEFAULT_EQUIPMENT_WEIGHTS);

  return DEFAULT_EQUIPMENT_WEIGHTS;
};
