import Database from "tauri-plugin-sql-api";
import { UserMeasurement } from "../../typings";

export const ReassignMeasurementIdForUserMeasurements = async (
  oldId: string,
  newId: string,
  userMeasurementList: UserMeasurement[]
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    for (let i = 0; i < userMeasurementList.length; i++) {
      const userMeasurement = userMeasurementList[i];

      const values = userMeasurement.userMeasurementValues;

      if (values === undefined) continue;

      if (oldId in values) {
        // Reassign key with the old Id to new Id
        values[newId] = values[oldId];
        delete values[oldId];
      } else {
        // Move to next item in list if values does not contain key of old Id
        continue;
      }

      const newValues = JSON.stringify(values);

      db.execute(
        "UPDATE user_measurements SET measurement_values = $1 WHERE id = $2",
        [newValues, userMeasurement.id]
      );
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
