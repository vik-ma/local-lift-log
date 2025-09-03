import { BodyMeasurements } from "../typings";

export const DEFAULT_BODY_MEASUREMENTS: BodyMeasurements = {
  id: 0,
  date: "",
  comment: null,
  weight: 0,
  weight_unit: "kg",
  body_fat_percentage: null,
  measurement_values: "{}",
  measurementsText: "",
  formattedDate: "",
  isExpanded: false,
  bodyMeasurementsValues: undefined,
  isInvalid: false,
};
