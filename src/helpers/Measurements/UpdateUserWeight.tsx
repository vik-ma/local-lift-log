import Database from "tauri-plugin-sql-api";
import { UserWeight } from "../../typings";

export const UpdateUserWeight = async (userWeight: UserWeight) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    await db.execute(
      `UPDATE user_weights 
       SET weight = $1, weight_unit = $2, date = $3, 
       comment = $4, body_fat_percentage = $5  
       WHERE id = $6`,
      [
        userWeight.weight,
        userWeight.weight_unit,
        userWeight.date,
        userWeight.comment,
        userWeight.body_fat_percentage,
        userWeight.id,
      ]
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
