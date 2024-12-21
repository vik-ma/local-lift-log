import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import {
  UseExerciseListReturnType,
  UseFilterExerciseListReturnType,
  UserSettings,
  UseWorkoutListReturnType,
  UseWorkoutTemplateListReturnType,
} from "../../typings";
import { useMemo, useState } from "react";
import {
  RoutineModalList,
  ExerciseModalList,
  ExerciseGroupCheckboxes,
  FilterDateRangeAndWeekdays,
  WorkoutTemplateModalList,
} from "..";

type FilterWorkoutListModalProps = {
  useWorkoutList: UseWorkoutListReturnType;
  useExerciseList: UseExerciseListReturnType;
  useFilterExerciseList: UseFilterExerciseListReturnType;
  useWorkoutTemplateList: UseWorkoutTemplateListReturnType;
  userSettings: UserSettings;
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
  useFilterExerciseList,
  useWorkoutTemplateList,
  userSettings,
}: FilterWorkoutListModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const { filterWorkoutListModal, routineList, listFilters } = useWorkoutList;

  const {
    handleFilterSaveButton,
    resetFilter,
    showResetFilterButton,
    filterRoutines,
    setFilterRoutines,
    filterExercises,
    setFilterExercises,
    filterExerciseGroups,
    setFilterExerciseGroups,
    filterRoutinesString,
    filterExercisesString,
    filterExerciseGroupsString,
    handleClickRoutine,
    handleClickExercise,
    filterWorkoutTemplates,
    setFilterWorkoutTemplates,
    filterWorkoutTemplatesString,
    handleClickWorkoutTemplate,
  } = listFilters;

  const {
    exerciseGroupDictionary,
    includeSecondaryGroups,
    setIncludeSecondaryGroups,
  } = useExerciseList;

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
            <ModalBody>
              {modalPage === "routine-list" ? (
                <RoutineModalList
                  useRoutineList={routineList}
                  onClickAction={handleClickRoutine}
                  activeRoutineId={userSettings.active_routine_id}
                  highlightedRoutines={filterRoutines}
                  customHeightString="h-[400px]"
                />
              ) : modalPage === "exercise-list" ? (
                <ExerciseModalList
                  handleClickExercise={handleClickExercise}
                  exerciseList={useExerciseList}
                  useFilterExerciseList={useFilterExerciseList}
                  userSettingsId={userSettings.id}
                  filterExercises={filterExercises}
                />
              ) : modalPage === "exercise-groups" ? (
                <div className="h-[400px]">
                  <ExerciseGroupCheckboxes
                    isValid={true}
                    value={filterExerciseGroups}
                    handleChange={setFilterExerciseGroups}
                    exerciseGroupDictionary={exerciseGroupDictionary}
                    includeSecondaryGroups={includeSecondaryGroups}
                    setIncludeSecondaryGroups={setIncludeSecondaryGroups}
                  />
                </div>
              ) : modalPage === "workout-template-list" ? (
                <WorkoutTemplateModalList
                  useWorkoutTemplateList={useWorkoutTemplateList}
                  onClickAction={handleClickWorkoutTemplate}
                  filterWorkoutTemplates={filterWorkoutTemplates}
                />
              ) : (
                <ScrollShadow className="h-[400px]">
                  <div className="flex flex-col gap-3 w-[24rem]">
                    <FilterDateRangeAndWeekdays
                      useListFilters={listFilters}
                      locale={userSettings.locale}
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Routines{" "}
                          {filterRoutines.size > 0 &&
                            `(${filterRoutines.size})`}
                        </h3>
                        <div className="flex justify-between items-center pl-0.5">
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
                        <div className="flex justify-between items-center pl-0.5">
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
                        <div className="flex justify-between items-center pl-0.5">
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
                        <div className="flex justify-between items-center pl-0.5">
                          <div
                            className={
                              filterExerciseGroups.length === 0
                                ? "flex flex-col w-[16rem] text-sm break-words text-stone-400"
                                : "flex flex-col w-[16rem] text-sm break-words text-secondary"
                            }
                          >
                            <span>{filterExerciseGroupsString}</span>
                            {filterExerciseGroups.length > 0 &&
                              includeSecondaryGroups && (
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
                      ? () =>
                          handleFilterSaveButton(
                            userSettings.locale,
                            filterWorkoutListModal
                          )
                      : () => setModalPage("base")
                  }
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
