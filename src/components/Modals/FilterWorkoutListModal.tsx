import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@heroui/react";
import {
  UseExerciseListReturnType,
  UserSettings,
  UseWorkoutListReturnType,
  UseWorkoutTemplateListReturnType,
  Routine,
  Exercise,
  WorkoutTemplate,
  ListFilterValues,
} from "../../typings";
import { useEffect, useMemo, useState } from "react";
import {
  RoutineModalList,
  ExerciseModalList,
  ExerciseGroupCheckboxes,
  FilterDateRangeAndWeekdays,
  WorkoutTemplateModalList,
} from "..";
import {
  GetFilterExerciseGroupsString,
  HandleFilterListObjectClick,
} from "../../helpers";
import { useFilterDateRangeAndWeekdays } from "../../hooks";
import { MODAL_BODY_HEIGHT } from "../../constants";

type FilterWorkoutListModalProps = {
  useWorkoutList: UseWorkoutListReturnType;
  useExerciseList: UseExerciseListReturnType;
  useWorkoutTemplateList: UseWorkoutTemplateListReturnType;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

type ModalPage =
  | "base"
  | "routine-list"
  | "exercise-list"
  | "exercise-groups"
  | "workout-template-list";

export const FilterWorkoutListModal = ({
  useWorkoutList,
  useExerciseList,
  useWorkoutTemplateList,
  userSettings,
  setUserSettings,
}: FilterWorkoutListModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");
  const [filterRoutines, setFilterRoutines] = useState<Set<number>>(new Set());
  const [filterExercises, setFilterExercises] = useState<Set<number>>(
    new Set()
  );
  const [filterExerciseGroups, setFilterExerciseGroups] = useState<string[]>(
    []
  );
  const [filterWorkoutTemplates, setFilterWorkoutTemplates] = useState<
    Set<number>
  >(new Set());
  const [includeSecondaryExerciseGroups, setIncludeSecondaryExerciseGroups] =
    useState<boolean>(false);

  const { filterWorkoutListModal, routineList, listFilters } = useWorkoutList;

  const {
    handleFilterSaveButton,
    resetFilter,
    getFilterRoutinesString,
    getFilterExercisesString,
    getFilterWorkoutTemplatesString,
    filterMap,
    weekdayMap,
    listFilterValues,
  } = listFilters;

  const { exerciseGroupDictionary } = useExerciseList;

  const filterDateRangeAndWeekdays = useFilterDateRangeAndWeekdays();

  const {
    filterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    areDateRangeAndWeekdaysFiltersEmpty,
  } = filterDateRangeAndWeekdays;

  const {
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
  } = filterDateRange;

  const showClearAllButton = useMemo(() => {
    if (modalPage === "routine-list" && filterRoutines.size > 0) {
      return true;
    }

    if (modalPage === "exercise-list" && filterExercises.size > 0) {
      return true;
    }

    if (modalPage === "exercise-groups" && filterExerciseGroups.length > 0) {
      return true;
    }

    if (
      modalPage === "workout-template-list" &&
      filterWorkoutTemplates.size > 0
    ) {
      return true;
    }

    return false;
  }, [
    modalPage,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterWorkoutTemplates,
  ]);

  const handleClearAllButton = () => {
    if (modalPage === "routine-list") {
      setFilterRoutines(new Set());
    }

    if (modalPage === "exercise-list") {
      setFilterExercises(new Set());
    }

    if (modalPage === "exercise-groups") {
      setFilterExerciseGroups([]);
    }

    if (modalPage === "workout-template-list") {
      setFilterWorkoutTemplates(new Set());
    }
  };

  const isFilterButtonDisabled = useMemo(() => {
    return modalPage === "base" && isMaxDateBeforeMinDate;
  }, [modalPage, isMaxDateBeforeMinDate]);

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (!areDateRangeAndWeekdaysFiltersEmpty) return true;
    if (filterRoutines.size > 0) return true;
    if (filterExercises.size > 0) return true;
    if (filterExerciseGroups.length > 0) return true;
    if (filterWorkoutTemplates.size > 0) return true;

    return false;
  }, [
    filterMap,
    areDateRangeAndWeekdaysFiltersEmpty,
    filterRoutines,
    filterExercises,
    filterExerciseGroups,
    filterWorkoutTemplates,
  ]);

  const filterRoutinesString = useMemo(() => {
    return getFilterRoutinesString(filterRoutines);
  }, [getFilterRoutinesString, filterRoutines]);

  const filterExercisesString = useMemo(() => {
    return getFilterExercisesString(filterExercises);
  }, [getFilterExercisesString, filterExercises]);

  const filterExerciseGroupsString = useMemo(() => {
    return GetFilterExerciseGroupsString(
      filterExerciseGroups,
      exerciseGroupDictionary
    );
  }, [exerciseGroupDictionary, filterExerciseGroups]);

  const filterWorkoutTemplatesString = useMemo(() => {
    return getFilterWorkoutTemplatesString(filterWorkoutTemplates);
  }, [getFilterWorkoutTemplatesString, filterWorkoutTemplates]);

  const handleClickRoutine = (routine: Routine) => {
    HandleFilterListObjectClick(routine, filterRoutines, setFilterRoutines);
  };

  const handleClickExercise = (exercise: Exercise) => {
    HandleFilterListObjectClick(exercise, filterExercises, setFilterExercises);
  };

  const handleClickWorkoutTemplate = (workoutTemplate: WorkoutTemplate) => {
    HandleFilterListObjectClick(
      workoutTemplate,
      filterWorkoutTemplates,
      setFilterWorkoutTemplates
    );
  };

  const handleSaveButton = () => {
    if (isFilterButtonDisabled) return;

    const filterValues: ListFilterValues = {
      ...listFilterValues,
      filterMinDate: filterMinDate,
      filterMaxDate: filterMaxDate,
      filterWeekdays: filterWeekdays,
      filterRoutines: filterRoutines,
      filterExercises: filterExercises,
      filterExerciseGroups: filterExerciseGroups,
      filterWorkoutTemplates: filterWorkoutTemplates,
      includeSecondaryExerciseGroups: includeSecondaryExerciseGroups,
    };

    handleFilterSaveButton(
      userSettings.locale,
      filterValues,
      filterWorkoutListModal
    );
  };

  useEffect(() => {
    setFilterMinDate(listFilterValues.filterMinDate);
    setFilterMaxDate(listFilterValues.filterMaxDate);
    setFilterWeekdays(listFilterValues.filterWeekdays);
    setFilterRoutines(listFilterValues.filterRoutines);
    setFilterExercises(listFilterValues.filterExercises);
    setFilterExerciseGroups(listFilterValues.filterExerciseGroups);
    setFilterWorkoutTemplates(listFilterValues.filterWorkoutTemplates);
    setIncludeSecondaryExerciseGroups(
      listFilterValues.includeSecondaryExerciseGroups
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilterValues]);

  return (
    <Modal
      isOpen={filterWorkoutListModal.isOpen}
      onOpenChange={filterWorkoutListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "routine-list"
                ? "Select Routines To Filter"
                : modalPage === "exercise-list"
                ? "Select Exercises To Filter"
                : modalPage === "exercise-groups"
                ? "Select Exercise Groups To Filter"
                : modalPage === "workout-template-list"
                ? "Select Workout Templates To Filter"
                : "Filter Workouts"}
            </ModalHeader>
            <ModalBody className="py-0">
              {modalPage === "routine-list" ? (
                <RoutineModalList
                  useRoutineList={routineList}
                  onClickAction={handleClickRoutine}
                  activeRoutineId={userSettings.active_routine_id}
                  highlightedRoutines={filterRoutines}
                />
              ) : modalPage === "exercise-list" ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  useExerciseList={useExerciseList}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                  selectedExercises={filterExercises}
                />
              ) : modalPage === "exercise-groups" ? (
                <div className={`${MODAL_BODY_HEIGHT}`}>
                  <ExerciseGroupCheckboxes
                    isValid={true}
                    value={filterExerciseGroups}
                    handleChange={setFilterExerciseGroups}
                    exerciseGroupDictionary={exerciseGroupDictionary}
                    includeSecondaryGroups={includeSecondaryExerciseGroups}
                    setIncludeSecondaryGroups={
                      setIncludeSecondaryExerciseGroups
                    }
                  />
                </div>
              ) : modalPage === "workout-template-list" ? (
                <WorkoutTemplateModalList
                  useWorkoutTemplateList={useWorkoutTemplateList}
                  onClickAction={handleClickWorkoutTemplate}
                  userSettings={userSettings}
                  filterWorkoutTemplates={filterWorkoutTemplates}
                />
              ) : (
                <ScrollShadow className={`${MODAL_BODY_HEIGHT}`}>
                  <div className="flex flex-col gap-3.5 w-[24rem]">
                    <FilterDateRangeAndWeekdays
                      useFilterDateRangeAndWeekdays={filterDateRangeAndWeekdays}
                      locale={userSettings.locale}
                      weekdayMap={weekdayMap}
                    />
                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Routines{" "}
                          {filterRoutines.size > 0 &&
                            `(${filterRoutines.size})`}
                        </h3>
                        <div className="flex justify-between items-center pl-[3px]">
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
                            className="w-[7rem]"
                            variant="flat"
                            size="sm"
                            onPress={() => setModalPage("routine-list")}
                          >
                            Filter Routines
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Workout Templates{" "}
                          {filterWorkoutTemplates.size > 0 &&
                            `(${filterWorkoutTemplates.size})`}
                        </h3>
                        <div className="flex justify-between items-center pl-[3px]">
                          <div
                            className={
                              filterWorkoutTemplates.size === 0
                                ? "w-[16rem] text-sm break-words text-stone-400"
                                : "w-[16rem] text-sm break-words text-secondary"
                            }
                          >
                            {filterWorkoutTemplatesString}
                          </div>
                          <Button
                            className="w-[7rem]"
                            variant="flat"
                            size="sm"
                            onPress={() =>
                              setModalPage("workout-template-list")
                            }
                          >
                            Filter Templates
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Exercises{" "}
                          {filterExercises.size > 0 &&
                            `(${filterExercises.size})`}
                        </h3>
                        <div className="flex justify-between items-center pl-[3px]">
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
                            className="w-[7rem]"
                            variant="flat"
                            size="sm"
                            onPress={() => setModalPage("exercise-list")}
                          >
                            Filter Exercises
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Exercise Groups{" "}
                          {filterExerciseGroups.length > 0 &&
                            `(${filterExerciseGroups.length})`}
                        </h3>
                        <div className="flex justify-between items-center pl-[3px]">
                          <div
                            className={
                              filterExerciseGroups.length === 0
                                ? "flex flex-col w-[16rem] text-sm break-words text-stone-400"
                                : "flex flex-col w-[16rem] text-sm break-words text-secondary"
                            }
                          >
                            <span>{filterExerciseGroupsString}</span>
                            {filterExerciseGroups.length > 0 &&
                              includeSecondaryExerciseGroups && (
                                <span className="text-stone-600 font-medium text-xs">
                                  Including Secondary Exercise Groups
                                </span>
                              )}
                          </div>
                          <Button
                            className="w-[7rem]"
                            variant="flat"
                            size="sm"
                            onPress={() => setModalPage("exercise-groups")}
                          >
                            Filter Groups
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
                {modalPage !== "base" ? (
                  <>
                    {showClearAllButton && (
                      <Button
                        variant="flat"
                        color="danger"
                        onPress={handleClearAllButton}
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
                        onPress={() => resetFilter(userSettings)}
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    modalPage === "base" ? onClose : () => setModalPage("base")
                  }
                >
                  {modalPage === "base" ? "Close" : "Back"}
                </Button>
                <Button
                  color="primary"
                  onPress={
                    modalPage === "base"
                      ? handleSaveButton
                      : () => setModalPage("base")
                  }
                  isDisabled={isFilterButtonDisabled}
                >
                  {modalPage === "base" ? "Filter" : "Done"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
