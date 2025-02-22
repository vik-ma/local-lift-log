import Database from "tauri-plugin-sql-api";
import { IsNumberValidId } from "../Numbers/IsNumberValidId";
import { Measurement } from "../../typings";

export const GetMeasurementListWithNumberOfUserMeasurementEntries =
  async (): Promise<{
    measurements: Measurement[];
    newMeasurementMap: Map<string, Measurement>;
  }> => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      const measurementValues: {
        measurement_values: string;
      }[] = await db.select(
        `SELECT measurement_values FROM user_measurements 
         WHERE 
          date IS NOT NULL 
          AND date LIKE '____-__-__T__:__:__.___Z'
          AND date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9].[0-9][0-9][0-9]Z'
          AND json_valid(measurement_values) = 1`
      );

      const measurementCountMap = new Map<number, number>();

      for (const row of measurementValues) {
        const measurementIds = Object.keys(JSON.parse(row.measurement_values));

        for (const measurementId of measurementIds) {
          const id = Number(measurementId);

          if (!IsNumberValidId(id)) continue;

          if (measurementCountMap.has(id)) {
            const newValue = measurementCountMap.get(id)! + 1;
            measurementCountMap.set(id, newValue);
          } else {
            measurementCountMap.set(id, 1);
          }
        }
      }

      const measurements = await db.select<Measurement[]>(
        "SELECT * FROM measurements"
      );

      const measurementMap = new Map<string, Measurement>();

      for (const measurement of measurements) {
        if (measurementCountMap.has(measurement.id)) {
          measurement.numUserMeasurementEntries = measurementCountMap.get(
            measurement.id
          )!;
        } else {
          measurement.numUserMeasurementEntries = 0;
        }

        measurementMap.set(measurement.id.toString(), measurement);
      }

      return { measurements, newMeasurementMap: measurementMap };
    } catch (error) {
      console.log(error);
      return { measurements: [], newMeasurementMap: new Map() };
    }
  };
