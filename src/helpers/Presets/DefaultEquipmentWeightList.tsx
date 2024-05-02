type DefaultEquipmentWeight = {
  name: string;
  weight: number;
  weight_unit: string;
};

export const DefaultEquipmentWeightList = (
  isMetric: boolean
): DefaultEquipmentWeight[] => {
  const defaultEquipmentWeightList: DefaultEquipmentWeight[] = [
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

  return defaultEquipmentWeightList;
};
