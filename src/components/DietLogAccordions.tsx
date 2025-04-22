import { AnimatePresence, motion } from "framer-motion";
import { ChevronIcon, VerticalMenuIcon } from "../assets";
import { DietLog } from "../typings";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { EmptyListLabel } from "./EmptyListLabel";
import { IsYmdDateStringTodayOrYesterday } from "../helpers";

type DietLogAccordionsProps = {
  dietLogEntries: DietLog[];
  handleDietLogAccordionClick: (dietLog: DietLog, index: number) => void;
  handleDietLogOptionSelection: (key: string, dietLog: DietLog) => void;
  showDayLabel?: boolean;
};

export const DietLogAccordions = ({
  dietLogEntries,
  handleDietLogAccordionClick,
  handleDietLogOptionSelection,
  showDayLabel,
}: DietLogAccordionsProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {dietLogEntries.map((dietLog, index) => {
        const todayOrYesterdayNum = !showDayLabel
          ? 0
          : IsYmdDateStringTodayOrYesterday(dietLog.date);

        return (
          <div
            key={dietLog.id}
            className={
              dietLog.disableExpansion
                ? "flex flex-col select-none bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                : "flex flex-col select-none cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
            }
            onClick={
              dietLog.disableExpansion
                ? () => {}
                : () => handleDietLogAccordionClick(dietLog, index)
            }
          >
            <div className="flex justify-between items-center pl-2 py-1">
              <div className="flex flex-col items-start">
                <span className="w-[19rem] break-all text-left font-medium text-stone-600">
                  {dietLog.calories} kcal
                </span>
                <span className="text-xs text-secondary text-left">
                  {dietLog.formattedDate}{" "}
                  {todayOrYesterdayNum === 1 && (
                    <span className="text-slate-400">(Today)</span>
                  )}
                  {todayOrYesterdayNum === 2 && (
                    <span className="text-slate-400">(Yesterday)</span>
                  )}
                </span>
                <span className="w-[19rem] break-all text-xs text-stone-400 text-left">
                  {dietLog.comment}
                </span>
              </div>
              <div className="flex justify-end w-[4.75rem] gap-0.5 pr-1 items-center">
                {!dietLog.disableExpansion && (
                  <ChevronIcon
                    size={29}
                    color="#a8a29e"
                    direction={dietLog.isExpanded ? "down" : "left"}
                  />
                )}
                <Dropdown shouldBlockScroll={false}>
                  <DropdownTrigger>
                    <Button
                      aria-label={`Toggle ${dietLog.formattedDate} Diet Log Entry Options Menu`}
                      isIconOnly
                      className="z-1"
                      radius="lg"
                      variant="light"
                    >
                      <VerticalMenuIcon size={19} color="#888" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label={`Option Menu For ${dietLog.formattedDate} Diet Log Entry`}
                    onAction={(key) =>
                      handleDietLogOptionSelection(key as string, dietLog)
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
              {dietLog.isExpanded && (
                <motion.div
                  initial={{ height: 0, overflow: "hidden" }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0, overflow: "hidden" }}
                  transition={{
                    height: { duration: 0.07 },
                  }}
                >
                  <div className="flex flex-col divide-y divide-stone-200 text-sm pb-0.5">
                    {dietLog.fat !== null && (
                      <div className="flex px-2">
                        <div className="font-medium text-stone-600 w-[3.75rem]">
                          Fat:{" "}
                        </div>
                        <span className="text-slate-500">
                          <span className="font-medium">{dietLog.fat}</span> g
                        </span>
                      </div>
                    )}
                    {dietLog.carbs !== null && (
                      <div className="flex px-2">
                        <div className="font-medium text-stone-600 w-[3.75rem]">
                          Carbs:{" "}
                        </div>
                        <span className="text-slate-500">
                          <span className="font-medium">{dietLog.carbs}</span> g
                        </span>
                      </div>
                    )}
                    {dietLog.protein !== null && (
                      <div className="flex px-2">
                        <div className="font-medium text-stone-600 w-[3.75rem]">
                          Protein:{" "}
                        </div>
                        <span className="text-slate-500">
                          <span className="font-medium">{dietLog.protein}</span>{" "}
                          g
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      {dietLogEntries.length === 0 && (
        <EmptyListLabel itemName="Diet Log Entries" />
      )}
    </div>
  );
};
