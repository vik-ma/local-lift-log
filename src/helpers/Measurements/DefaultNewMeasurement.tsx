import { Measurement } from "../../typings";

export const DefaultNewMeasurement = () => {
  const defaultNewMeasurement: Measurement = {
    id: 0,
    name: "",
    default_unit: "cm",
    measurement_type: "Circumference",
    is_favorite: 0,
  };

  return defaultNewMeasurement;
};
