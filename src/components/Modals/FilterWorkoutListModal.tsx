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
import { Routine, UseWorkoutListReturnType } from "../../typings";
import { I18nProvider } from "@react-aria/i18n";
import { WeekdaysDropdown } from "../Dropdowns/WeekdaysDropdown";
import { useMemo, useState } from "react";
import { RoutineModalList } from "../RoutineModalList";

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

  const handleClickRoutine = (routine: Routine) => {
    const updatedRoutineSet = new Set(filterRoutines);

    if (updatedRoutineSet.has(routine.id)) {
      updatedRoutineSet.delete(routine.id);
    } else {
      updatedRoutineSet.add(routine.id);
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
                  <RoutineModalList
                    onClickAction={handleClickRoutine}
                    routineMap={routineMap}
                    filterRoutines={filterRoutines}
                  />
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
                              ? "w-[16rem] text-sm break-words text-stone-400"
                              : "w-[16rem] text-sm break-words text-secondary"
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
