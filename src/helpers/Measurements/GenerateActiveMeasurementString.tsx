export const GenerateActiveMeasurementString = (
  activeMeasurementSet: Set<number>
) => {
  const activeMeasurementString = Array.from(activeMeasurementSet).join(",");

  return activeMeasurementString;
};
