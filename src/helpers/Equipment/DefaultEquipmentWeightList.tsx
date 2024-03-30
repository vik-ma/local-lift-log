export const DefaultEquipmentWeightList = (isMetric: boolean) => {
  const defaultEquipmentWeightList = [];

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
