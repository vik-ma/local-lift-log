import { useState, useEffect } from "react";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { UserMeasurementEntry } from "../typings";
import { CreateMeasurementList, GetClockStyle } from "../helpers";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import { AnimatePresence, motion } from "framer-motion";

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
          <div className="flex flex-col gap-1 w-full">
            {userMeasurementEntries.map((measurement, index) => (
              <div
                key={measurement.id}
                className="flex flex-col cursor-pointer gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                onClick={() =>
                  handleMeasurementAccordionClick(measurement, index)
                }
              >
                <div className="flex flex-row justify-between w-full gap-2 items-center">
                  <div className="flex flex-col justify-start items-start">
                    <span className="w-[19rem] break-all text-left">
                      {measurement.measurementListString}
                    </span>
                    <span className="text-xs text-yellow-600 text-left">
                      {measurement.formattedDate}
                    </span>
                    <span className="w-[19rem] break-all text-xs text-stone-500 text-left">
                      {measurement.comment}
                    </span>
                  </div>
                  <div className="flex gap-1 px-0.5 items-center">
                    <ChevronIcon
                      size={27}
                      color="#a8a29e"
                      direction={measurement.isExpanded ? "down" : "left"}
                    />
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
                  </div>
                </div>
                <AnimatePresence>
                  {measurement.isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.1 },
                        opacity: { duration: 0.05 },
                      }}
                    >
                      <div className="flex flex-col text-sm">
                        {measurement.measurementList?.map((measurement) => (
                          <div
                            className="flex gap-2 text-left"
                            key={measurement.id}
                          >
                            <span className="w-[9rem] truncate">
                              {measurement.name}
                            </span>
                            <div
                              className={
                                measurement.unit === "in"
                                  ? "flex"
                                  : "flex gap-1"
                              }
                            >
                              <span className="max-w-[4rem] truncate font-medium">
                                {measurement.value}
                              </span>
                              <span>
                                {measurement.unit === "in"
                                  ? `″`
                                  : measurement.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
