import Database from "tauri-plugin-sql-api";
import {
  CreateDetailedUserMeasurementList,
  GetCurrentDateTimeISOString,
} from "..";
import { MeasurementMap, UserMeasurement } from "../../typings";

export const InsertUserMeasurementIntoDatabase = async (
  userMeasurementValues: string,
  commentToInsert: string | null,
  clockStyle: string,
  measurementMap: MeasurementMap
) => {
  try {
    const currentDateString = GetCurrentDateTimeISOString();

    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into user_measurements (date, comment, measurement_values) 
       VALUES ($1, $2, $3)`,
      [currentDateString, commentToInsert, userMeasurementValues]
    );

    const newUserMeasurements: UserMeasurement = {
      id: result.lastInsertId,
      date: currentDateString,
      comment: commentToInsert,
      measurement_values: userMeasurementValues,
    };

    const detailedActiveMeasurement = CreateDetailedUserMeasurementList(
      [newUserMeasurements],
      measurementMap,
      clockStyle
    );

    return detailedActiveMeasurement[0];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
