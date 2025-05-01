import Database from "tauri-plugin-sql-api";
import {
  ConvertEmptyStringToNull,
  ConvertInputStringToNumberWithTwoDecimalsOrNull,
  ConvertNumberToTwoDecimals,
  CreateBodyMeasurementsValues,
  CreateDetailedBodyMeasurementsList,
  GetCurrentDateTimeISOString,
  IsStringEmpty,
} from "..";
import {
  BodyMeasurements,
  MeasurementMap,
  UseBodyMeasurementsInputReturnType,
} from "../../typings";

export const InsertBodyMeasurementsIntoDatabase = async (
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
    const currentDateString = GetCurrentDateTimeISOString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into body_measurements 
       (date, weight, weight_unit, body_fat_percentage, measurement_values, comment) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        currentDateString,
        weight,
        weightUnit,
        bodyFatPercentage,
        measurementValues,
        comment,
      ]
    );

    const bodyMeasurements: BodyMeasurements = {
      id: result.lastInsertId,
      date: currentDateString,
      weight: weight,
      weight_unit: weightUnit,
      body_fat_percentage: bodyFatPercentage,
      measurement_values: measurementValues,
      comment: comment,
    };

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [bodyMeasurements],
      measurementMap,
      clockStyle,
      result.lastInsertId
    );

    return detailedBodyMeasurements[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
