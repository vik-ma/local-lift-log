import Database from "tauri-plugin-sql-api";
import { UserWeight } from "../../typings";

export const UpdateUserWeight = async (userWeight: UserWeight) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      "UPDATE user_weights SET weight = $1, weight_unit = $2, comment = $3 WHERE id = $4",
      [
        userWeight.weight,
        userWeight.weight_unit,
        userWeight.comment,
        userWeight.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
