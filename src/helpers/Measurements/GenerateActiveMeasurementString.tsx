export const GenerateActiveMeasurementString = (
  activeMeasurementList: number[]
) => {
  const activeMeasurementString = activeMeasurementList.join(",");

  return activeMeasurementString;
};
