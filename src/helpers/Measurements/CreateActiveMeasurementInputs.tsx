import { Measurement } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { GenerateActiveMeasurementList } from "./GenerateActiveMeasurementList";

export const CreateActiveMeasurementInputs = async (
  activeMeasurementsString: string
): Promise<Measurement[]> => {
  const activeMeasurements: Measurement[] = [];
  try {
    const db = await Database.load(import.meta.env.VITE_DB);
    const activeMeasurementList = GenerateActiveMeasurementList(
      activeMeasurementsString
    );
    for (let i = 0; i < activeMeasurementList.length; i++) {
      const result = await db.select<Measurement[]>(
        "SELECT * FROM measurements WHERE id = $1",
        [activeMeasurementList[i]]
      );

      if (result.length === 0) continue;

      const measurement: Measurement = {
        ...result[0],
        input: "",
      };

      activeMeasurements.push(measurement);
    }
  } catch (error) {
    console.log(error);
  }
  return activeMeasurements;
};
