import { ActiveMeasurementInput, Measurement } from "../../typings";
import Database from "tauri-plugin-sql-api";
import { GenerateActiveMeasurementList } from "./GenerateActiveMeasurementList";

export const CreateActiveMeasurementInputs = async (
  activeMeasurementsString: string
): Promise<ActiveMeasurementInput[]> => {
  const activeMeasurements: ActiveMeasurementInput[] = [];
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

      const measurement: ActiveMeasurementInput = {
        measurement_id: result[0].id,
        measurement_name: result[0].name,
        default_unit: result[0].default_unit,
        measurement_type: result[0].measurement_type,
        value: "",
      };

      activeMeasurements.push(measurement);
    }
  } catch (error) {
    console.log(error);
  }
  return activeMeasurements;
};
