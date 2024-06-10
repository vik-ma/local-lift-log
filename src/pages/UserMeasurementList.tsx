import { useState, useEffect } from "react";
import { LoadingSpinner, UserMeasurementAccordion } from "../components";
import Database from "tauri-plugin-sql-api";
import { UserMeasurementEntry } from "../typings";
import { CreateMeasurementList, GetClockStyle } from "../helpers";

export default function UserMeasurementList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userMeasurementEntries, setUserMeasurementEntries] = useState<
    UserMeasurementEntry[]
  >([]);

  useEffect(() => {
    const getUserMeasurements = async (clockStyle: string) => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<UserMeasurementEntry[]>(
          "SELECT * FROM user_measurement_entries ORDER BY id DESC"
        );

        const userMeasurementEntries = await CreateMeasurementList(
          result,
          clockStyle
        );

        setUserMeasurementEntries(userMeasurementEntries);
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      const userSettings = await GetClockStyle();

      if (userSettings?.clock_style) {
        getUserMeasurements(userSettings.clock_style);
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  const handleMeasurementAccordionClick = (
    measurement: UserMeasurementEntry,
    index: number
  ) => {
    const updatedMeasurement: UserMeasurementEntry = {
      ...measurement,
      isExpanded: !measurement.isExpanded,
    };

    const updatedMeasurementEntries = [...userMeasurementEntries];
    updatedMeasurementEntries[index] = updatedMeasurement;

    setUserMeasurementEntries(updatedMeasurementEntries);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            User Measurements
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <UserMeasurementAccordion
            userMeasurementEntries={userMeasurementEntries}
            handleMeasurementAccordionClick={handleMeasurementAccordionClick}
          />
        )}
      </div>
    </>
  );
}
