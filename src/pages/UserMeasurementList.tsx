import { useState, useEffect } from "react";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { UserMeasurementEntry, Measurement } from "../typings";
import { Accordion, AccordionItem } from "@nextui-org/react";

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
          const measurementList = await db.select<Measurement[]>(
            "SELECT * FROM user_measurements WHERE user_measurement_entry_id = $1",
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
        <div>
          <Accordion variant="splitted">
            {userMeasurementEntries.map((entry, index) => (
              <AccordionItem
                key={`${index}`}
                aria-label={`Accordion Item ${index}`}
                subtitle={`${entry.measurementList?.length} Measurements`}
                title={entry.date}
              ></AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
}
