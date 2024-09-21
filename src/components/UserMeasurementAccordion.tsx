import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import { AnimatePresence, motion } from "framer-motion";
import {
  MeasurementMap,
  UserMeasurement,
  ReassignMeasurementsProps,
} from "../typings";
import { EmptyListLabel } from ".";

type UserMeasurementAccordionProps = {
  userMeasurementEntries: UserMeasurement[];
  handleMeasurementAccordionClick: (
    measurement: UserMeasurement,
    index: number
  ) => void;
  measurementMap: MeasurementMap;
  handleUserMeasurementsOptionSelection: (
    key: string,
    userMeasurements: UserMeasurement
  ) => void;
  handleReassignMeasurement?: (values: ReassignMeasurementsProps) => void;
};

export const UserMeasurementAccordion = ({
  userMeasurementEntries,
  handleMeasurementAccordionClick,
  measurementMap,
  handleUserMeasurementsOptionSelection,
  handleReassignMeasurement = () => {},
}: UserMeasurementAccordionProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {userMeasurementEntries.map((measurement, index) => (
        <div
          key={measurement.id}
          className="flex flex-col select-none cursor-pointer gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
          onClick={() => handleMeasurementAccordionClick(measurement, index)}
        >
          <div className="flex flex-row justify-between w-full gap-2 items-center">
            <div className="flex flex-col justify-start items-start">
              <span className="w-[19rem] break-all text-left">
                {measurement.measurementListText}
              </span>
              <span className="text-xs text-secondary text-left">
                {measurement.formattedDate}
              </span>
              <span className="w-[19rem] break-all text-xs text-stone-400 text-left">
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
                    aria-label={`Toggle ${measurement.formattedDate} Measurements Entry Options Menu`}
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
                  onAction={(key) =>
                    handleUserMeasurementsOptionSelection(
                      key as string,
                      measurement
                    )
                  }
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
                  {Object.entries(measurement.userMeasurementValues!).map(
                    ([key, values]) => {
                      const item = measurementMap.get(key);
                      const name = item ? item.name : "Unknown";
                      values.isInvalid = item ? false : true;

                      return (
                        <div
                          className="flex gap-2 text-left items-center"
                          key={key}
                        >
                          <div
                            className={
                              values.isInvalid
                                ? "flex gap-1.5 items-center w-[9rem] truncate text-red-700"
                                : "w-[9rem] truncate"
                            }
                          >
                            <span>{values.isInvalid ? "Unknown" : name}</span>
                            {values.isInvalid && (
                              <Button
                                className="h-6"
                                size="sm"
                                variant="flat"
                                onPress={() =>
                                  handleReassignMeasurement({
                                    id: key,
                                    unit: values.unit,
                                    measurement_type: values.measurement_type,
                                  })
                                }
                              >
                                Reassign
                              </Button>
                            )}
                          </div>
                          <div
                            className={
                              values.unit === "in" ? "flex" : "flex gap-1"
                            }
                          >
                            <span className="max-w-[3.5rem] truncate font-medium">
                              {values.value}
                            </span>
                            <span>
                              {values.unit === "in" ? `″` : values.unit}
                            </span>
                          </div>
                          <span className="flex-grow text-right px-3.5">
                            {values.measurement_type}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
      {userMeasurementEntries.length === 0 && (
        <EmptyListLabel itemName="User Measurements" />
      )}
    </div>
  );
};
