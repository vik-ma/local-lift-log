import Database from "tauri-plugin-sql-api";
import { BodyMeasurements } from "../../typings";

export const ReassignMeasurementIdForBodyMeasurements = async (
  oldId: string,
  newId: string,
  bodyMeasurementsList: BodyMeasurements[]
): Promise<boolean> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    for (let i = 0; i < bodyMeasurementsList.length; i++) {
      const userMeasurement = bodyMeasurementsList[i];

      const values = userMeasurement.bodyMeasurementsValues;

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
        "UPDATE body_measurements SET measurement_values = $1 WHERE id = $2",
        [newValues, userMeasurement.id]
      );
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
