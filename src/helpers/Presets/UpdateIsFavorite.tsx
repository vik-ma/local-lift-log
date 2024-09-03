import Database from "tauri-plugin-sql-api";

type TargetType = "exercise" | "equipment-weight" | "distance";

export const UpdateIsFavorite = async (
  id: number,
  targetType: TargetType,
  value: 0 | 1
): Promise<boolean> => {
  let queryString: string = "";

  if (targetType === "exercise") {
    queryString = "UPDATE exercises SET is_favorite = $1 WHERE id = $2";
  } else if (targetType === "equipment-weight") {
    queryString = "UPDATE equipment_weights SET is_favorite = $1 WHERE id = $2";
  } else if (targetType === "distance") {
    queryString = "UPDATE distances SET is_favorite = $1 WHERE id = $2";
  } else return false;

  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(queryString, [value, id]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
