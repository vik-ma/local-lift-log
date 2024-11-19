import Database from "tauri-plugin-sql-api";

export const InsertUserWeightIntoDatabase = async (
  weight: number,
  weightUnit: string,
  dateISOString: string,
  comment: string | null
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      "INSERT into user_weights (weight, weight_unit, date, comment) VALUES ($1, $2, $3, $4)",
      [weight, weightUnit, dateISOString, comment]
    );

    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
