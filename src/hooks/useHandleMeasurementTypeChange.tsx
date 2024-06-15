import { Measurement } from "../typings";

export const useHandleMeasurementTypeChange = (
  defaultUnitMeasurement: string,
  setMeasurement: React.Dispatch<React.SetStateAction<Measurement>>
) => {
  const handleMeasurementTypeChange = (measurementType: string) => {
    const newDefaultUnit: string =
      measurementType === "Caliper" ? "mm" : defaultUnitMeasurement;

    setMeasurement((prev) => ({
      ...prev,
      default_unit: newDefaultUnit,
      measurement_type: measurementType,
    }));
  };

  return handleMeasurementTypeChange;
};
