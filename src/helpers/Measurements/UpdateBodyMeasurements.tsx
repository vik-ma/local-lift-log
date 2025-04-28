import Database from "tauri-plugin-sql-api";
import { BodyMeasurements } from "../../typings";

export const UpdateBodyMeasurements = async (
  bodyMeasurements: BodyMeasurements
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE body_measurements SET 
        date = $1, weight = $2, weight_unit = $3, body_fat_percentage = $4, 
        measurement_values = $5, comment = $6
       WHERE id = $7`,
      [
        bodyMeasurements.date,
        bodyMeasurements.weight,
        bodyMeasurements.weight_unit,
        bodyMeasurements.body_fat_percentage,
        bodyMeasurements.measurement_values,
        bodyMeasurements.comment,
        bodyMeasurements.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
