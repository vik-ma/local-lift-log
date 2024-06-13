import Database from "tauri-plugin-sql-api";
import { UserMeasurement } from "../../typings";

export const UpdateUserMeasurements = async (
  userMeasurements: UserMeasurement
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE user_measurements SET date = $1, comment = $2, measurement_values = $3 
       WHERE id = $4`,
      [
        userMeasurements.date,
        userMeasurements.comment,
        userMeasurements.measurement_values,
        userMeasurements.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
