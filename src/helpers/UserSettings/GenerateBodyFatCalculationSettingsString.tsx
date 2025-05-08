import { Measurement } from "../../typings";

export const GenerateBodyFatCalculationSettingsString = (
  isMale: boolean,
  ageGroup: string,
  measurementList: (Measurement | undefined)[]
) => {
  const gender = isMale ? "male" : "female";

  const measurementsString = measurementList
    .map((measurement) => {
      if (measurement !== undefined) return measurement.id;
      else return 0;
    })
    .join(",");

  const stats = [gender, ageGroup, measurementsString];

  return stats.join("/");
};
