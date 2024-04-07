type DefaultEquipmentWeight = {
  name: string;
  weight: number;
  weight_unit: string;
};

export const DefaultEquipmentWeightList = (
  isMetric: boolean
): DefaultEquipmentWeight[] => {
  const defaultEquipmentWeightList: DefaultEquipmentWeight[] = [];

  if (isMetric) {
    // Metric Units
    defaultEquipmentWeightList.push({
      name: "Barbell",
      weight: 20,
      weight_unit: "kg",
    });
    defaultEquipmentWeightList.push({
      name: "Dumbbell",
      weight: 2,
      weight_unit: "kg",
    });
  } else {
    // Imperial Units
    defaultEquipmentWeightList.push({
      name: "Barbell",
      weight: 45,
      weight_unit: "lbs",
    });
    defaultEquipmentWeightList.push({
      name: "Dumbbell",
      weight: 5,
      weight_unit: "lbs",
    });
  }

  return defaultEquipmentWeightList;
};
