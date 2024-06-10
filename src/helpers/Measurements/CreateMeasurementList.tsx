import { UserMeasurement, UserMeasurementEntry } from "../../typings";
import { GenerateMeasurementListString, FormatDateTimeString } from "..";
import Database from "tauri-plugin-sql-api";

export const CreateMeasurementList = async (
  userMeasurementEntryList: UserMeasurementEntry[],
  clockStyle: string
): Promise<UserMeasurementEntry[]> => {
  if (userMeasurementEntryList.length === 0) return [];

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    for (let i = 0; i < userMeasurementEntryList.length; i++) {
      const result = await db.select<UserMeasurement[]>(
        `SELECT user_measurements.*, 
          COALESCE(measurements.name, 'Unknown') AS name, 
          COALESCE(measurements.measurement_type, 'Unknown') AS type
          FROM user_measurements LEFT JOIN 
          measurements ON user_measurements.measurement_id = measurements.id 
          WHERE user_measurement_entry_id = $1;`,
        [userMeasurementEntryList[i].id]
      );

      userMeasurementEntryList[i].measurementList = result;
      userMeasurementEntryList[i].measurementListString =
        GenerateMeasurementListString(result);
      userMeasurementEntryList[i].formattedDate = FormatDateTimeString(
        userMeasurementEntryList[i].date,
        clockStyle === "24h"
      );
      userMeasurementEntryList[i].isExpanded = false;
    }

    return userMeasurementEntryList;
  } catch (error) {
    console.log(error);
    return [];
  }
};
