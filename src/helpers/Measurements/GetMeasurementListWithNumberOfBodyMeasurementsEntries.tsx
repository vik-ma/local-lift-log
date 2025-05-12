import Database from "tauri-plugin-sql-api";
import { IsNumberValidId } from "..";
import { Measurement } from "../../typings";

export const GetMeasurementListWithNumberOfBodyMeasurementsEntries = async (
  ignoreMeasurementsWithNoEntries?: boolean
): Promise<{
  measurements: Measurement[];
  newMeasurementMap: Map<string, Measurement>;
}> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const measurementValues: {
      measurement_values: string;
    }[] = await db.select(
      `SELECT measurement_values FROM body_measurements 
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

    const measurementList = await db.select<Measurement[]>(
      `SELECT * FROM measurements 
       WHERE 
        (measurement_type = 'Caliper' AND default_unit = 'mm')
        OR
        (measurement_type = 'Circumference' AND default_unit IN ('mm', 'cm', 'in'))`
    );

    const measurements: Measurement[] = [];
    const measurementMap = new Map<string, Measurement>();

    for (const measurement of measurementList) {
      if (measurementCountMap.has(measurement.id)) {
        measurement.numBodyMeasurementsEntries = measurementCountMap.get(
          measurement.id
        )!;
      } else {
        measurement.numBodyMeasurementsEntries = 0;
      }

      if (
        ignoreMeasurementsWithNoEntries &&
        measurement.numBodyMeasurementsEntries === 0
      )
        continue;

      measurements.push(measurement);
      measurementMap.set(measurement.id.toString(), measurement);
    }

    return { measurements, newMeasurementMap: measurementMap };
  } catch (error) {
    console.log(error);
    return { measurements: [], newMeasurementMap: new Map() };
  }
};
