type DefaultMeasurement = {
  name: string;
  default_unit: string;
  measurement_type: string;
};

export const DefaultMeasurements = (
  isMetric: boolean
): DefaultMeasurement[] => {
  const DEFAULT_MEASUREMENTS: DefaultMeasurement[] = [
    {
      name: "Neck",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Chest",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Biceps (Right)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Biceps (Left)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Forearm (Right)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Forearm (Left)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Waist",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Hip",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Thigh (Right)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Thigh (Left)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Calf (Right)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },
    {
      name: "Calf (Left)",
      default_unit: isMetric ? "cm" : "in",
      measurement_type: "Circumference",
    },

    {
      name: "Chest",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Biceps",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Triceps",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Midaxillary",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Subscapular",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Suprailiac",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Abdominal",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Lower Back",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Thigh",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
    {
      name: "Calf",
      default_unit: "mm",
      measurement_type: "Caliper",
    },
  ];

  Object.freeze(DEFAULT_MEASUREMENTS);

  return DEFAULT_MEASUREMENTS;
};
