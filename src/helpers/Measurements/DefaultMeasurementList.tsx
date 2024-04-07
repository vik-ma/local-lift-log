type DefaultMeasurement = {
  name: string;
  measurement_type: string;
};

export const DefaultMeasurementList = (): DefaultMeasurement[] => {
  const defaultMeasurementList: DefaultMeasurement[] = [];

  defaultMeasurementList.push({
    name: "Neck",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Chest",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Biceps (Right)",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Biceps (Left)",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Forearm (Right)",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Forearm (Left)",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Waist",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Hip",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Thigh (Right)",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Thigh (Left)",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Calf (Right)",
    measurement_type: "Circumference",
  });
  defaultMeasurementList.push({
    name: "Calf (Left)",
    measurement_type: "Circumference",
  });

  defaultMeasurementList.push({
    name: "Chest",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Biceps",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Triceps",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Midaxillary",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Subscapular",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Suprailiac",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Abdominal",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Lower Back",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Thigh",
    measurement_type: "Caliper",
  });
  defaultMeasurementList.push({
    name: "Calf",
    measurement_type: "Caliper",
  });

  return defaultMeasurementList;
};
