import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { VerticalMenuIcon, ChevronIcon } from "../assets";
import { AnimatePresence, motion } from "framer-motion";
import { MeasurementMap, UserMeasurement } from "../typings";

type UserMeasurementAccordionProps = {
  userMeasurementEntries: UserMeasurement[];
  handleMeasurementAccordionClick: (
    measurement: UserMeasurement,
    index: number
  ) => void;
  measurementMap: MeasurementMap;
};

export const UserMeasurementAccordion = ({
  userMeasurementEntries,
  handleMeasurementAccordionClick,
  measurementMap,
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
                  {Object.entries(measurement.userMeasurementValues!).map(
                    ([key, values]) => (
                      <div className="flex gap-2 text-left" key={key}>
                        <span className="w-[11rem] truncate">
                          {measurementMap[key]
                            ? measurementMap[key].name
                            : "Unknown Measurement"}
                        </span>
                        <div
                          className={
                            values.unit === "in" ? "flex" : "flex gap-1"
                          }
                        >
                          <span className="max-w-[4rem] truncate font-medium">
                            {values.value}
                          </span>
                          <span>
                            {values.unit === "in" ? `″` : values.unit}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
