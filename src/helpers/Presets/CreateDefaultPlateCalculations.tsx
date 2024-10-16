import Database from "tauri-plugin-sql-api";
import { AvailablePlates } from "../../typings";
import { IsNumberValidId } from "../Numbers/IsNumberValidId";
import { GenerateAvailablePlatesString } from "./GenerateAvailablePlatesString";

type DefaultPlateCalculation = {
  name: string;
  handle_id: number;
  available_plates_string: string;
  num_handles: number;
};

export const CreateDefaultPlateCalculations = async (
  weightIdList: number[],
  handleId: number
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

  const DEFAULT_PLATE_CALCULATIONS: DefaultPlateCalculation[] = [
    {
      name: "Barbell",
      handle_id: handleId,
      available_plates_string: availablePlatesString,
      num_handles: defaultNumHandles,
    },
  ];

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    for (let i = 0; i < DEFAULT_PLATE_CALCULATIONS.length; i++) {
      const plateCalculation = DEFAULT_PLATE_CALCULATIONS[i];

      await db.execute(
        `INSERT into plate_calculations 
         (name, handle_id, available_plates_string, num_handles) 
         VALUES ($1, $2, $3, $4)`,
        [
          plateCalculation.name,
          plateCalculation.handle_id,
          plateCalculation.available_plates_string,
          plateCalculation.num_handles,
        ]
      );
    }
  } catch (error) {
    console.log(error);
  }
};
