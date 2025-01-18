import Database from "tauri-plugin-sql-api";

export const InsertUserWeightIntoDatabase = async (
  weight: number,
  weightUnit: string,
  dateISOString: string,
  comment: string | null,
  bodyFatPercentage: number | null
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    const result = await db.execute(
      `INSERT into user_weights 
       (weight, weight_unit, date, comment, body_fat_percentage) 
       VALUES ($1, $2, $3, $4, $5)`,
      [weight, weightUnit, dateISOString, comment, bodyFatPercentage]
    );

    return result.lastInsertId;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
