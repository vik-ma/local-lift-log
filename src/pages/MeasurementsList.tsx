import { useState, useEffect } from "react";
import { LoadingSpinner, MeasurementUnitDropdown } from "../components";
import { Measurement, SetMeasurementsAction } from "../typings";
import Database from "tauri-plugin-sql-api";

export default function MeasurementsListPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [operatingMeasurement, setOperatingMeasurement] =
    useState<Measurement>();
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
            <div className="w-full">
              <div className="flex flex-col gap-1.5">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="flex flex-row justify-between items-center rounded-lg px-2 py-1 outline outline-2 outline-stone-300 bg-white hover:bg-stone-100"
                  >
                    <div className="flex flex-col">
                      <div className="text-lg truncate w-56">
                        {measurement.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {measurement.measurement_type}
                      </div>
                    </div>
                    <MeasurementUnitDropdown
                      value={measurement.default_unit}
                      setMeasurements={
                        setOperatingMeasurement as SetMeasurementsAction
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
