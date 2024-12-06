import Database from "tauri-plugin-sql-api";
import { AvailablePlates } from "../../typings";
import { IsNumberValidId } from "../Numbers/IsNumberValidId";
import { GenerateAvailablePlatesString } from "./GenerateAvailablePlatesString";

type DefaultPlateCollection = {
  name: string;
  handle_id: number;
  available_plates_string: string;
  num_handles: number;
  weight_unit: string;
};

export const CreateDefaultPlateCollections = async (
  weightIdList: number[],
  handleId: number,
  isMetric: boolean
) => {
  if (!IsNumberValidId(handleId) || weightIdList.length < 1) return;

  const defaultNumAvailable = 12;
  const defaultNumHandles = 1;

  const availablePlates: AvailablePlates[] = [];

  for (const weight of weightIdList) {
    availablePlates.push({
      equipmentWeightId: weight,
      numAvailable: defaultNumAvailable,
    });
  }

  const availablePlatesString = GenerateAvailablePlatesString(availablePlates);

  const DEFAULT_PLATE_CALCULATIONS: DefaultPlateCollection[] = [
    {
      name: "Barbell",
      handle_id: handleId,
      available_plates_string: availablePlatesString,
      num_handles: defaultNumHandles,
      weight_unit: isMetric ? "kg" : "lbs",
    },
  ];

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    for (let i = 0; i < DEFAULT_PLATE_CALCULATIONS.length; i++) {
      const plateCollection = DEFAULT_PLATE_CALCULATIONS[i];

      await db.execute(
        `INSERT into plate_calculations 
         (name, handle_id, available_plates_string, num_handles, weight_unit) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          plateCollection.name,
          plateCollection.handle_id,
          plateCollection.available_plates_string,
          plateCollection.num_handles,
          plateCollection.weight_unit,
        ]
      );
    }
  } catch (error) {
    console.log(error);
  }
};
