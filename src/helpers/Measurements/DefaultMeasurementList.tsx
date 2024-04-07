type DefaultMeasurement = {
  name: string;
  default_unit: string;
  measurement_type: string;
};

export const DefaultMeasurementList = (
  isMetric: boolean
): DefaultMeasurement[] => {
  const defaultMeasurementList: DefaultMeasurement[] = [];

  defaultMeasurementList.push({
    name: "Neck",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Chest",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Biceps (Right)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Biceps (Left)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Forearm (Right)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Forearm (Left)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Waist",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Hip",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Thigh (Right)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Thigh (Left)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Calf (Right)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Calf (Left)",
    default_unit: isMetric ? "cm" : "in",
    measurement_type: "Circumference",
  });

  defaultMeasurementList.push({
    name: "Chest",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Biceps",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Triceps",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Midaxillary",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Subscapular",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Suprailiac",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Abdominal",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Lower Back",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Thigh",
    default_unit: "mm",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Calf",
    default_unit: "mm",
    measurement_type: "Caliper",
  });

  return defaultMeasurementList;
};
