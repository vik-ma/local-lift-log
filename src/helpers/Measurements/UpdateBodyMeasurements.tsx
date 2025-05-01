import Database from "tauri-plugin-sql-api";
import {
  BodyMeasurements,
  MeasurementMap,
  UseBodyMeasurementsInputReturnType,
} from "../../typings";
import {
  ConvertEmptyStringToNull,
  ConvertInputStringToNumberWithTwoDecimalsOrNull,
  ConvertNumberToTwoDecimals,
  CreateBodyMeasurementsValues,
  CreateDetailedBodyMeasurementsList,
  IsStringEmpty,
} from "..";

export const UpdateBodyMeasurements = async (
  bodyMeasurements: BodyMeasurements,
  useBodyMeasurementsInput: UseBodyMeasurementsInputReturnType,
  clockStyle: string,
  measurementMap: MeasurementMap
) => {
  const {
    areBodyMeasurementsValid,
    weightInput,
    weightUnit,
    bodyFatPercentageInput,
    commentInput,
    activeMeasurements,
  } = useBodyMeasurementsInput;

  if (!areBodyMeasurementsValid) return undefined;

  const weight = IsStringEmpty(weightInput)
    ? 0
    : ConvertNumberToTwoDecimals(Number(weightInput));

  const bodyFatPercentage = ConvertInputStringToNumberWithTwoDecimalsOrNull(
    bodyFatPercentageInput
  );

  const comment = ConvertEmptyStringToNull(commentInput);

  const measurementValues = CreateBodyMeasurementsValues(activeMeasurements);

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE body_measurements SET 
        weight = $1, weight_unit = $2, body_fat_percentage = $3, 
        measurement_values = $4, comment = $5
       WHERE id = $6`,
      [
        bodyMeasurements.weight,
        bodyMeasurements.weight_unit,
        bodyMeasurements.body_fat_percentage,
        bodyMeasurements.measurement_values,
        bodyMeasurements.comment,
        bodyMeasurements.id,
      ]
    );

    const updatedBodyMeasurements: BodyMeasurements = {
      ...bodyMeasurements,
      weight: weight,
      weight_unit: weightUnit,
      body_fat_percentage: bodyFatPercentage,
      measurement_values: measurementValues,
      comment: comment,
    };

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [updatedBodyMeasurements],
      measurementMap,
      clockStyle,
      updatedBodyMeasurements.id
    );

    return detailedBodyMeasurements[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
