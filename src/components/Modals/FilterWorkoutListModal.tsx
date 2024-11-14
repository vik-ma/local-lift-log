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
import {
  Exercise,
  Routine,
  UseExerciseListReturnType,
  UseWorkoutListReturnType,
} from "../../typings";
import { I18nProvider } from "@react-aria/i18n";
import { WeekdaysDropdown } from "../Dropdowns/WeekdaysDropdown";
import { useMemo, useState } from "react";
import { RoutineModalList } from "../RoutineModalList";
import { ExerciseModalList } from "../ExerciseModalList";

type FilterWorkoutListModalProps = {
  useWorkoutList: UseWorkoutListReturnType;
  useExerciseList: UseExerciseListReturnType;
  locale: string;
};

type FilterWorkoutListModalPage = "base" | "routine-list" | "exercise-list";

export const FilterWorkoutListModal = ({
  useWorkoutList,
  useExerciseList,
  locale,
}: FilterWorkoutListModalProps) => {
  const [filterWorkoutListModalPage, setFilterWorkoutListModalPage] =
    useState<FilterWorkoutListModalPage>("base");

  const {
    filterWorkoutListModal,
    handleFilterSaveButton,
    filterDateRange,
    setFilterDateRange,
    resetFilter,
    showResetFilterButton,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    filterRoutines,
    setFilterRoutines,
    routineList,
    filterExercises,
    setFilterExercises,
  } = useWorkoutList;

  const { routineMap } = routineList;

  const { exerciseMap } = useExerciseList;

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

  const filterExercisesString = useMemo(() => {
    if (filterExercises.size === 0) return "No Routines Selected";

    const exerciseNames: string[] = [];

    for (const exerciseId of filterExercises) {
      if (exerciseMap.has(exerciseId)) {
        const exercise = exerciseMap.get(exerciseId);
        exerciseNames.push(exercise!.name);
      }
    }

    return exerciseNames.join(", ");
  }, [filterExercises, exerciseMap]);

  const handleClickRoutine = (routine: Routine) => {
    const updatedRoutineSet = new Set(filterRoutines);

    if (updatedRoutineSet.has(routine.id)) {
      updatedRoutineSet.delete(routine.id);
    } else {
      updatedRoutineSet.add(routine.id);
    }

    setFilterRoutines(updatedRoutineSet);
  };

  const handleClickExercise = (exercise: Exercise) => {
    const updatedExerciseSet = new Set(filterExercises);

    if (updatedExerciseSet.has(exercise.id)) {
      updatedExerciseSet.delete(exercise.id);
    } else {
      updatedExerciseSet.add(exercise.id);
    }

    setFilterExercises(updatedExerciseSet);
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
              {filterWorkoutListModalPage === "routine-list" ? (
                <RoutineModalList
                  useRoutineList={routineList}
                  onClickAction={handleClickRoutine}
                  filterRoutines={filterRoutines}
                />
              ) : filterWorkoutListModalPage === "exercise-list" ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  exerciseList={useExerciseList}
                  customHeightString="h-[440px]"
                />
              ) : (
                <ScrollShadow className="h-[440px]">
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
                      <h3 className="font-semibold text-lg px-0.5">
                        Routines{" "}
                        {filterRoutines.size > 0 && `(${filterRoutines.size})`}
                      </h3>
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
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Exercises{" "}
                          {filterExercises.size > 0 &&
                            `(${filterExercises.size})`}
                        </h3>
                        <div className="flex justify-between items-center px-0.5">
                          <div
                            className={
                              filterExercises.size === 0
                                ? "w-[16rem] text-sm break-words text-stone-400"
                                : "w-[16rem] text-sm break-words text-secondary"
                            }
                          >
                            {filterExercisesString}
                          </div>
                          <Button
                            variant="flat"
                            size="sm"
                            onPress={() =>
                              setFilterWorkoutListModalPage("exercise-list")
                            }
                          >
                            Filter Exercises
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollShadow>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                {filterWorkoutListModalPage !== "base" ? (
                  <>
                    {filterRoutines.size > 0 && (
                      <Button
                        variant="flat"
                        color="danger"
                        onPress={() => setFilterRoutines(new Set())}
                      >
                        Clear All
                      </Button>
                    )}
                  </>
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
                  onPress={
                    filterWorkoutListModalPage === "base"
                      ? () => handleFilterSaveButton(locale)
                      : () => setFilterWorkoutListModalPage("base")
                  }
                >
                  {filterWorkoutListModalPage !== "base" ? "Done" : "Save"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
