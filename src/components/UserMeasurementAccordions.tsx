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

type UserMeasurementAccordionsProps = {
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

export const UserMeasurementAccordions = ({
  userMeasurementEntries,
  handleMeasurementAccordionClick,
  measurementMap,
  handleUserMeasurementsOptionSelection,
  handleReassignMeasurement = () => {},
}: UserMeasurementAccordionsProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {userMeasurementEntries.map((measurement, index) => (
        <div
          key={measurement.id}
          className="flex flex-col select-none cursor-pointer gap-1 bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
          onClick={() => handleMeasurementAccordionClick(measurement, index)}
        >
          <div className="flex justify-between items-center pl-2 py-1">
            <div className="flex flex-col items-start">
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
            <div className="flex gap-0.5 pr-1 items-center">
              <ChevronIcon
                size={29}
                color="#a8a29e"
                direction={measurement.isExpanded ? "down" : "left"}
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    aria-label={`Toggle ${measurement.formattedDate} Measurements Entry Options Menu`}
                    isIconOnly
                    className="z-1"
                    radius="lg"
                    variant="light"
                  >
                    <VerticalMenuIcon size={19} color="#888" />
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
                  <DropdownItem key="edit-timestamp">
                    Change Timestamp
                  </DropdownItem>
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
                initial={{ height: 0, overflow: "hidden" }}
                animate={{ height: "auto" }}
                exit={{ height: 0, overflow: "hidden" }}
                transition={{
                  height: { duration: 0.07 },
                }}
              >
                <div className="flex flex-col divide-y divide-stone-200 text-sm">
                  {Object.entries(measurement.userMeasurementValues!).map(
                    ([key, values]) => {
                      const item = measurementMap.get(key);
                      const name = item ? item.name : "Unknown";
                      values.isInvalid = item ? false : true;

                      return (
                        <div
                          className="flex gap-2 text-left items-center px-2 py-0.5"
                          key={key}
                        >
                          <div
                            className={
                              values.isInvalid
                                ? "flex gap-2 items-center w-[9rem] truncate text-red-700"
                                : "w-[9rem] truncate"
                            }
                          >
                            <span className="font-semibold">
                              {values.isInvalid ? "Unknown" : name}
                            </span>
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
                              values.unit === "in"
                                ? "flex w-[5.5rem]"
                                : "flex gap-1 w-[5.5rem]"
                            }
                          >
                            <span className="max-w-[3.5rem] truncate font-semibold">
                              {values.value}
                            </span>
                            <span className="font-medium">
                              {values.unit === "in" ? `″` : values.unit}
                            </span>
                          </div>
                          <span>{values.measurement_type}</span>
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
