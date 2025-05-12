import Database from "tauri-plugin-sql-api";
import { Measurement } from "../../typings";

export const GetMeasurementList = async (): Promise<{
  measurements: Measurement[];
  newMeasurementMap: Map<string, Measurement>;
}> => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.select<Measurement[]>(
      `SELECT * FROM measurements 
       WHERE 
        (measurement_type = 'Caliper' AND default_unit = 'mm')
        OR
        (measurement_type = 'Circumference' AND default_unit IN ('mm', 'cm', 'in'))`
    );

    const measurementMap = new Map<string, Measurement>(
      result.map((obj) => [obj.id.toString(), obj])
    );

    return { measurements: result, newMeasurementMap: measurementMap };
  } catch (error) {
    console.log(error);
    return { measurements: [], newMeasurementMap: new Map() };
  }
};
