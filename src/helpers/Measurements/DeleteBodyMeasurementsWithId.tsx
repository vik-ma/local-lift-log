import Database from "tauri-plugin-sql-api";

export const DeleteBodyMeasurementsWithId = async (
  bodyMeasurementsId: number
) => {
  try {
    const db = await Database.load(import.meta.env.VITE_DB);

    db.execute("DELETE from body_measurements WHERE id = $1", [
      bodyMeasurementsId,
    ]);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
