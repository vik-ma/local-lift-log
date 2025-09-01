import Database from "@tauri-apps/plugin-sql";
import { IsNumberValidBinary } from "..";

type TargetType = "exercise" | "equipment" | "distance" | "measurement";

export const UpdateIsFavorite = async (
  id: number,
  targetType: TargetType,
  value: 0 | 1
): Promise<boolean> => {
  if (!IsNumberValidBinary(value)) return false;

  let queryString: string = "";

  switch (targetType) {
    case "exercise":
      queryString = "UPDATE exercises SET is_favorite = $1 WHERE id = $2";
      break;
    case "equipment":
      queryString =
        "UPDATE equipment_weights SET is_favorite = $1 WHERE id = $2";
      break;
    case "distance":
      queryString = "UPDATE distances SET is_favorite = $1 WHERE id = $2";
      break;
    case "measurement":
      queryString = "UPDATE measurements SET is_favorite = $1 WHERE id = $2";
      break;
    default:
      return false;
  }

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(queryString, [value, id]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
