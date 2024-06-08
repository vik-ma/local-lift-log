import { useState, useEffect } from "react";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { UserMeasurementEntry, UserMeasurement } from "../typings";
import {
  FormatDateTimeString,
  GenerateMeasurementListString,
  GetClockStyle,
} from "../helpers";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { VerticalMenuIcon } from "../assets";

export default function UserMeasurementList() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userMeasurementEntries, setUserMeasurementEntries] = useState<
    UserMeasurementEntry[]
  >([]);
  const [clockStyle, setClockStyle] = useState<string>("");

  useEffect(() => {
    const getUserMeasurements = async (clockStyle: string) => {
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
          result[i].formattedDate = FormatDateTimeString(
            result[i].date,
            clockStyle === "24h"
          );
        }

        setUserMeasurementEntries(result);
      } catch (error) {
        console.log(error);
      }
    };

    const loadUserSettings = async () => {
      const userSettings = await GetClockStyle();

      if (userSettings?.clock_style) {
        setClockStyle(userSettings.clock_style);
        getUserMeasurements(userSettings.clock_style);
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, []);

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
          <div className="flex flex-col gap-1 w-full">
            {userMeasurementEntries.map((measurement) => (
              <div className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400">
                <div className="flex flex-col justify-start items-start">
                  <span className="w-[21.5rem] break-all text-left">
                    {measurement.measurementListString}
                  </span>
                  <span className="text-xs text-yellow-600 text-left">
                    {measurement.formattedDate}
                  </span>
                  <span className="w-[21.5rem] break-all text-xs text-stone-500 text-left">
                    {measurement.comment}
                  </span>
                </div>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      className="z-1"
                      size="sm"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon size={17} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={`Option Menu For ${measurement.formattedDate} Measurement Entry`}
                    // onAction={(key) =>
                    //   handleMeasurementOptionSelection(
                    //     key as string,
                    //     measurement
                    //   )
                    // }
                  >
                    <DropdownItem key="edit">Edit</DropdownItem>
                    <DropdownItem key="delete" className="text-danger">
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                {/* {entry.measurementList?.map((measurement) => (
                  <div className="grid grid-cols-3 gap-4" key={measurement.id}>
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
                ))} */}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
