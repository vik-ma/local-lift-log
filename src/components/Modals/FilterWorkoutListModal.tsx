import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  DateRangePicker,
  ScrollShadow,
} from "@nextui-org/react";
import { UseWorkoutListReturnType } from "../../typings";
import { I18nProvider } from "@react-aria/i18n";
import { WeekdaysDropdown } from "../Dropdowns/WeekdaysDropdown";
import { useMemo, useState } from "react";
import { FormatNumItemsString } from "../../helpers";

type FilterWorkoutListModalProps = {
  useWorkoutList: UseWorkoutListReturnType;
  locale: string;
};

type FilterWorkoutListModalPage = "base" | "routine-list";

export const FilterWorkoutListModal = ({
  useWorkoutList,
  locale,
}: FilterWorkoutListModalProps) => {
  const [filterWorkoutListModalPage, setFilterWorkoutListModalPage] =
    useState<FilterWorkoutListModalPage>("base");

  const {
    filterWorkoutListModal,
    handleFilterDoneButton,
    filterDateRange,
    setFilterDateRange,
    resetFilter,
    showResetFilterButton,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    routineMap,
    filterRoutines,
    setFilterRoutines,
  } = useWorkoutList;

  const filterRoutinesString = useMemo(() => {
    if (filterRoutines.size === 0) return "No Routines Selected";

    const routineNames: string[] = [];

    for (const routineId of filterRoutines) {
      if (routineMap.has(routineId)) {
        const routine = routineMap.get(routineId);
        routineNames.push(routine!.name);
      }
    }

    return routineNames.join(", ");
  }, [filterRoutines, routineMap]);

  const handleClickRoutine = (routineId: number) => {
    const updatedRoutineSet = new Set(filterRoutines);

    if (updatedRoutineSet.has(routineId)) {
      updatedRoutineSet.delete(routineId);
    } else {
      updatedRoutineSet.add(routineId);
    }

    setFilterRoutines(updatedRoutineSet);
  };

  return (
    <Modal
      isOpen={filterWorkoutListModal.isOpen}
      onOpenChange={filterWorkoutListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {filterWorkoutListModalPage === "routine-list"
                ? "Select Routines To Filter"
                : "Filter Workouts"}
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[440px]">
                {filterWorkoutListModalPage === "routine-list" ? (
                  <div className="flex flex-col gap-1">
                    {Array.from(routineMap).map(([routineId, routine]) => {
                      const numWorkoutTemplates =
                        routine.numWorkoutTemplates ?? 0;
                      return (
                        <div
                          className={
                            filterRoutines.has(routineId)
                              ? "flex justify-between items-center bg-lime-100 border-2 border-lime-300 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                              : "flex justify-between items-center bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          }
                          key={routineId}
                        >
                          <button
                            className="flex flex-col justify-start items-start pl-2 py-1"
                            onClick={() => handleClickRoutine(routineId)}
                          >
                            <span className="w-[22rem] truncate text-left">
                              {routine.name}
                            </span>
                            {numWorkoutTemplates > 0 && (
                              <span className="text-xs text-secondary text-left">
                                {FormatNumItemsString(
                                  numWorkoutTemplates,
                                  "Workout"
                                )}
                              </span>
                            )}
                            <span className="text-xs text-stone-400 text-left">
                              {routine.is_schedule_weekly === 0
                                ? `${routine.num_days_in_schedule} Day Schedule`
                                : "Weekly Schedule"}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 w-[24rem]">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-lg px-0.5">
                        Date Range
                      </h3>
                      <I18nProvider locale={locale}>
                        <DateRangePicker
                          label="Workout Dates"
                          variant="faded"
                          value={filterDateRange}
                          onChange={setFilterDateRange}
                          visibleMonths={2}
                        />
                      </I18nProvider>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-lg px-0.5">Weekdays</h3>
                      <WeekdaysDropdown
                        values={filterWeekdays}
                        setValues={setFilterWeekdays}
                        weekdayMap={weekdayMap}
                      />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg px-0.5">Routines</h3>
                      <div className="flex justify-between items-center px-0.5">
                        <div
                          className={
                            filterRoutines.size === 0
                              ? "w-[16rem] text-sm break-all text-stone-400"
                              : "w-[16rem] text-sm break-all text-secondary"
                          }
                        >
                          {filterRoutinesString}
                        </div>
                        <Button
                          variant="flat"
                          size="sm"
                          onPress={() =>
                            setFilterWorkoutListModalPage("routine-list")
                          }
                        >
                          Filter Routines
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollShadow>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {filterWorkoutListModalPage !== "base" ? (
                  <Button
                    variant="flat"
                    onPress={() => setFilterWorkoutListModalPage("base")}
                  >
                    Back
                  </Button>
                ) : (
                  <>
                    {showResetFilterButton && (
                      <Button
                        variant="flat"
                        color="danger"
                        onPress={resetFilter}
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleFilterDoneButton(locale)}
                  isDisabled={filterWorkoutListModalPage !== "base"}
                >
                  Save
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
