import { BodyMeasurements } from "../../typings";

export const DefaultNewBodyMeasurements = () => {
  const defaultNewBodyMeasurements: BodyMeasurements = {
    id: 0,
    date: "",
    comment: null,
    weight: 0,
    weight_unit: "kg",
    body_fat_percentage: null,
    measurement_values: "{}",
    measurementListText: "",
    formattedDate: "",
    isExpanded: false,
    userMeasurementValues: undefined,
    isInvalid: false,
  };

  return defaultNewBodyMeasurements;
};
