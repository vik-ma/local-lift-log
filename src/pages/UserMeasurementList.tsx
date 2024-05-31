import { useState, useEffect } from "react";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { UserMeasurementEntry, UserMeasurement } from "../typings";
import { Accordion, AccordionItem } from "@nextui-org/react";
import {
  FormatDateTimeString,
  GenerateMeasurementListString,
  GetClockStyle,
} from "../helpers";

export default function UserMeasurementList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userMeasurementEntries, setUserMeasurementEntries] = useState<
    UserMeasurementEntry[]
  >([]);
  const [clockStyle, setClockStyle] = useState<string>("");

  useEffect(() => {
    const getUserMeasurements = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserMeasurementEntry[]>(
          "SELECT * FROM user_measurement_entries ORDER BY id DESC"
        );

        for (let i = 0; i < result.length; i++) {
          const measurementList = await db.select<UserMeasurement[]>(
            `SELECT user_measurements.*, 
            COALESCE(measurements.name, 'Unknown') AS name, 
            COALESCE(measurements.measurement_type, 'Unknown') AS type
            FROM user_measurements LEFT JOIN 
            measurements ON user_measurements.measurement_id = measurements.id 
            WHERE user_measurement_entry_id = $1;`,
            [result[i].id]
          );
          result[i].measurementList = measurementList;
          result[i].measurementListString =
            GenerateMeasurementListString(measurementList);
        }

        setUserMeasurementEntries(result);
      } catch (error) {
        console.log(error);
      }
    };

    const getClockStyle = async () => {
      const userSettings = await GetClockStyle();

      if (userSettings?.clock_style) {
        setClockStyle(userSettings.clock_style);
        setIsLoading(false);
      }
    };

    getUserMeasurements();
    getClockStyle();
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
            className="break-words"
            variant="splitted"
            selectionMode="multiple"
          >
            {userMeasurementEntries.map((entry, index) => (
              <AccordionItem
                key={`${index}`}
                aria-label={`Accordion Item ${index}`}
                subtitle={entry.measurementListString}
                title={FormatDateTimeString(entry.date, clockStyle === "24h")}
              >
                <div className="flex flex-col ">
                  <span className="font-medium text-amber-500 ">
                    {entry.comment}
                  </span>
                  {entry.measurementList?.map((measurement) => (
                    <div
                      className="grid grid-cols-3 gap-4"
                      key={measurement.id}
                    >
                      <span className="col-span-2 font-semibold truncate">
                        {measurement.name}
                      </span>
                      <div
                        className={
                          measurement.unit === "in" ? "flex" : "flex gap-1"
                        }
                      >
                        <span className="truncate max-w-16">
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
