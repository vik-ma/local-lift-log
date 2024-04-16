import { useState, useEffect } from "react";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { UserMeasurementEntry, UserMeasurement } from "../typings";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { FormatDateTimeString } from "../helpers";

export default function UserMeasurementList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userMeasurementEntries, setUserMeasurementEntries] = useState<
    UserMeasurementEntry[]
  >([]);

  useEffect(() => {
    const getUserMeasurements = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserMeasurementEntry[]>(
          "SELECT * FROM user_measurement_entries"
        );

        for (let i = 0; i < result.length; i++) {
          const measurementList = await db.select<UserMeasurement[]>(
            `SELECT user_measurements.*, 
             measurements.name AS name, measurements.measurement_type AS type
             FROM user_measurements 
             JOIN measurements ON user_measurements.measurement_id = measurements.id 
             WHERE user_measurement_entry_id = $1`,
            [result[i].id]
          );
          result[i].measurementList = measurementList;
        }

        setUserMeasurementEntries(result);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getUserMeasurements();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            User Measurements
          </h1>
        </div>
        {isLoading ? <LoadingSpinner /> : <></>}
        <div className="w-full">
          <Accordion
            className="break-all"
            variant="splitted"
            selectionMode="multiple"
          >
            {userMeasurementEntries.map((entry, index) => (
              <AccordionItem
                key={`${index}`}
                aria-label={`Accordion Item ${index}`}
                subtitle={`${entry.measurementList?.length} Measurements`}
                title={FormatDateTimeString(entry.date)}
              >
                <div className="flex flex-col ">
                  <span className="font-medium text-amber-500 ">
                    {entry.comment}
                  </span>
                  {entry.measurementList?.map((measurement) => (
                    <div className="grid grid-cols-2 gap-4" key={measurement.id}>
                      <span className="font-semibold truncate">{measurement.name}</span>
                      <div
                        className={
                          measurement.unit === "in" ? "flex" : "flex gap-1"
                        }
                      >
                        <span className="truncate max-w-36">
                          {measurement.value}
                        </span>
                        <span>
                          {measurement.unit === "in" ? `″` : measurement.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
}
