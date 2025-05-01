import Database from "tauri-plugin-sql-api";
import { FormatDateTimeString, ValidateISODateString } from "..";
import { BodyMeasurements } from "../../typings";

export const UpdateBodyMeasurementsTimestamp = async (
  bodyMeasurements: BodyMeasurements,
  dateString: string,
  clockStyle: string
) => {
  if (!ValidateISODateString(dateString)) return undefined;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(`UPDATE body_measurements SET date = $1 WHERE id = $2`, [
      dateString,
      bodyMeasurements.id,
    ]);

    const formattedDate = FormatDateTimeString(
      dateString,
      clockStyle === "24h"
    );

    const updatedBodyMeasurements: BodyMeasurements = {
      ...bodyMeasurements,
      date: dateString,
      formattedDate: formattedDate,
    };

    return updatedBodyMeasurements;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
