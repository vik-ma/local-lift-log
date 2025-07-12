import Database from "@tauri-apps/plugin-sql";
import {
  CreateDetailedBodyMeasurementsList,
  GetCurrentDateTimeISOString,
} from "..";
import { BodyMeasurements, MeasurementMap } from "../../typings";

export const InsertBodyMeasurementsIntoDatabase = async (
  bodyMeasurements: BodyMeasurements,
  clockStyle: string,
  measurementMap: MeasurementMap
) => {
  try {
    const currentDateString = GetCurrentDateTimeISOString();

    bodyMeasurements.date = currentDateString;

    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into body_measurements 
       (date, weight, weight_unit, body_fat_percentage, measurement_values, comment) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        bodyMeasurements.date,
        bodyMeasurements.weight,
        bodyMeasurements.weight_unit,
        bodyMeasurements.body_fat_percentage,
        bodyMeasurements.measurement_values,
        bodyMeasurements.comment,
      ]
    );

    bodyMeasurements.id = result.lastInsertId;

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [bodyMeasurements],
      measurementMap,
      clockStyle,
      result.lastInsertId
    );

    console.log(detailedBodyMeasurements);

    return detailedBodyMeasurements[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
