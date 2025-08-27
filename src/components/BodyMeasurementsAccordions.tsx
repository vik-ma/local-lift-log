import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import { AnimatePresence, motion } from "framer-motion";
import {
  MeasurementMap,
  BodyMeasurements,
  ReassignMeasurementsProps,
} from "../typings";
import { EmptyListLabel } from ".";

type BodyMeasurementAccordionsProps = {
  bodyMeasurements: BodyMeasurements[];
  handleBodyMeasurementsAccordionClick: (
    measurement: BodyMeasurements,
    index: number
  ) => void;
  measurementMap: MeasurementMap;
  handleBodyMeasurementsOptionSelection: (
    key: string,
    bodyMeasurements: BodyMeasurements
  ) => void;
  handleReassignMeasurement: (values: ReassignMeasurementsProps) => void;
};

export const BodyMeasurementsAccordions = ({
  bodyMeasurements,
  handleBodyMeasurementsAccordionClick,
  measurementMap,
  handleBodyMeasurementsOptionSelection,
  handleReassignMeasurement,
}: BodyMeasurementAccordionsProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {bodyMeasurements.map((measurement, index) => {
        const header =
          measurement.weight > 0
            ? // Show weight as header if set
              `${measurement.weight} ${measurement.weight_unit}`
            : // Show num measurements as header if no weight is set
            measurement.measurementsText !== undefined
            ? measurement.measurementsText
            : // Show Body Fat % as header if only body_fat_percentage is set
              `${measurement.body_fat_percentage}% Body Fat`;

        return (
          <div
            key={index}
            className={
              measurement.disableExpansion
                ? "flex flex-col select-none bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                : "flex flex-col select-none cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            }
            onClick={
              measurement.disableExpansion
                ? () => {}
                : () => handleBodyMeasurementsAccordionClick(measurement, index)
            }
          >
            <div className="flex justify-between items-center pl-2 py-1">
              <div className="flex flex-col items-start">
                <span className="w-[19rem] text-stone-600 font-medium truncate">
                  {header}
                  {/* Show body_fat_percentage next to the header if
                      body_fat_percentage is set and either weight or any 
                      body measurements are set */}
                  {measurement.body_fat_percentage !== null &&
                    (measurement.weight !== 0 ||
                      measurement.measurementsText !== undefined) && (
                      <span className="text-xs text-slate-500">
                        {" "}
                        ({measurement.body_fat_percentage}% Body Fat)
                      </span>
                    )}
                </span>
                <span className="text-xs text-secondary">
                  {measurement.formattedDate}
                </span>
                {/* Show num measurements below header (and date) if both 
                    weight and any body measurements are set */}
                {measurement.weight !== 0 &&
                  measurement.measurementsText !== undefined && (
                    <span className="w-[19rem] break-all text-xs text-stone-400">
                      {measurement.measurementsText}
                    </span>
                  )}
                <span className="w-[19rem] break-all text-xs text-slate-400">
                  {measurement.comment}
                </span>
              </div>
              <div className="flex gap-0.5 pr-1 items-center">
                {!measurement.disableExpansion && (
                  <ChevronIcon
                    size={29}
                    color="#a8a29e"
                    direction={measurement.isExpanded ? "down" : "left"}
                  />
                )}
                <Dropdown shouldBlockScroll={false}>
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
                    aria-label={`Options Menu For ${measurement.formattedDate} Measurement Entry`}
                    onAction={(key) =>
                      handleBodyMeasurementsOptionSelection(
                        key as string,
                        measurement
                      )
                    }
                  >
                    <DropdownItem key="edit" className="text-slate-400">
                      Edit
                    </DropdownItem>
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
                  <div className="flex flex-col divide-y divide-stone-200 text-sm pb-px">
                    {Object.entries(measurement.bodyMeasurementsValues!).map(
                      ([key, values]) => {
                        const item = measurementMap.get(key);
                        const name = item ? item.name : "Unknown";
                        values.isInvalid = item ? false : true;

                        return (
                          <div
                            className="flex justify-between text-stone-600 text-left items-center px-2 py-0.5"
                            key={key}
                          >
                            <div className="flex gap-2">
                              <div
                                className={
                                  values.isInvalid
                                    ? "flex gap-2 items-center w-[9.75rem] truncate text-red-700"
                                    : "w-[9.75rem] truncate "
                                }
                              >
                                <span className="font-medium">
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
                                        measurement_type:
                                          values.measurement_type,
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
                                    ? "flex w-[6rem] bg-red-30"
                                    : "flex gap-1 w-[6rem] bg-red-30"
                                }
                              >
                                <span className="max-w-[4rem] truncate font-semibold">
                                  {values.value}
                                </span>
                                <span className="font-medium">
                                  {values.unit === "in" ? `″` : values.unit}
                                </span>
                              </div>
                            </div>
                            <span className="text-right w-[6rem]">
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
        );
      })}
      {bodyMeasurements.length === 0 && (
        <EmptyListLabel itemName="Body Measurements" />
      )}
    </div>
  );
};
