import { useState, useEffect } from "react";
import { LoadingSpinner } from "../components";
import { Measurement } from "../typings";
import Database from "tauri-plugin-sql-api";

export default function MeasurementsListPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getMeasurements = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Measurement[]>(
          "SELECT * FROM measurements"
        );

        setMeasurements(result);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getMeasurements();
  }, []);
  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Measurements
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-4 items-center"></div>
          </>
        )}
      </div>
    </>
  );
}
