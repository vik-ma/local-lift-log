import Database from "tauri-plugin-sql-api";
import { BodyMeasurements, MeasurementMap } from "../../typings";
import { CreateDetailedBodyMeasurementsList } from "..";

export const UpdateBodyMeasurements = async (
  bodyMeasurements: BodyMeasurements,
  clockStyle: string,
  measurementMap: MeasurementMap
) => {
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

    const detailedBodyMeasurements = CreateDetailedBodyMeasurementsList(
      [bodyMeasurements],
      measurementMap,
      clockStyle,
      bodyMeasurements.id
    );

    return detailedBodyMeasurements[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
