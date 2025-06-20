import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  ConvertDateStringToTimeString,
  ConvertSetInputValuesToNumbers,
} from "../helpers";
import {
  ChevronIcon,
  CommentIcon,
  VerticalMenuIcon,
  MinimizeIcon,
} from "../assets";
import { SetList, SetValueInputs } from ".";
import {
  GroupedWorkoutSet,
  UserSettings,
  WorkoutSet,
  ActiveSetNote,
  Exercise,
  SetListNotes,
  UseSetTrackingInputsReturnType,
  UserWeight,
} from "../typings";
import { useSetTrackingInputs } from "../hooks";
import { useEffect } from "react";

type ActiveSetProps = {
  activeSet: WorkoutSet | undefined;
  setActiveSet: React.Dispatch<React.SetStateAction<WorkoutSet | undefined>>;
  isActiveSetExpanded: boolean;
  setIsActiveSetExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  userSettings: UserSettings;
  activeGroupedSet: GroupedWorkoutSet | undefined;
  handleReassignExercise: (
    groupedWorkoutSet: GroupedWorkoutSet,
    set?: WorkoutSet
  ) => void;
  handleActiveSetOptionSelection: (key: string) => void;
  activeSetNote: ActiveSetNote | undefined;
  setActiveSetNote: React.Dispatch<
    React.SetStateAction<ActiveSetNote | undefined>
  >;
  handleClickSet: (
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => void;
  handleSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => void;
  updateShownSetListComments: (groupedSetId: string, index: number) => void;
  shownSetListComments: SetListNotes;
  handleEditSet: (
    set: WorkoutSet,
    index: number,
    exercise: Exercise,
    groupedSet: GroupedWorkoutSet
  ) => void;
  saveActiveSet: (set: WorkoutSet) => void;
  handleToggleSetCommentButton: (
    set: WorkoutSet,
    index: number,
    groupedSet: GroupedWorkoutSet
  ) => void;
  populateUserWeightValues: () => void;
  openCalculationModal: (
    isWeight: boolean,
    exercise: Exercise,
    isActiveSet: boolean,
    setInputs: UseSetTrackingInputsReturnType,
    set: WorkoutSet
  ) => Promise<void>;
  showGetUserWeightButton: boolean;
  showOldUserWeightLabel: boolean;
  setShowOldUserWeightLabel: React.Dispatch<React.SetStateAction<boolean>>;
  userWeight: UserWeight | undefined;
};

export const ActiveSet = ({
  activeSet,
  setActiveSet,
  isActiveSetExpanded,
  setIsActiveSetExpanded,
  userSettings,
  activeGroupedSet,
  handleReassignExercise,
  handleActiveSetOptionSelection,
  activeSetNote,
  setActiveSetNote,
  handleClickSet,
  handleSetOptionSelection,
  updateShownSetListComments,
  shownSetListComments,
  handleEditSet,
  saveActiveSet,
  handleToggleSetCommentButton,
  populateUserWeightValues,
  openCalculationModal,
  showGetUserWeightButton,
  showOldUserWeightLabel,
  setShowOldUserWeightLabel,
  userWeight,
}: ActiveSetProps) => {
  let setCounter = 1;
  // Assign Multiset Set number
  if (activeGroupedSet?.isMultiset && activeSet) {
    for (const [key, value] of activeGroupedSet.multiset!
      .setListIndexCutoffs!) {
      if (key > activeSet.set_index!) break;
      setCounter = value;
    }
  }

  const exerciseIndex = activeGroupedSet?.isMultiset
    ? activeSet?.set_index ?? 0
    : 0;

  const activeSetInputs = useSetTrackingInputs();

  const {
    uneditedSet,
    setUneditedSet,
    isSetEdited,
    setIsSetEdited,
    assignSetTrackingValuesInputs,
    isSetTrackingValuesInvalid,
    setTrackingValuesInput,
    clearSetInputValues,
    timeInSeconds,
    areInputsEmpty,
  } = activeSetInputs;

  const resetSetInputValues = () => {
    if (
      uneditedSet === undefined ||
      activeSet === undefined ||
      uneditedSet.id !== activeSet.id
    )
      return;

    const oldSet = { ...uneditedSet };
    setActiveSet(oldSet);
    setIsSetEdited(false);
    assignSetTrackingValuesInputs(oldSet);
  };

  const handleSaveButton = () => {
    if (activeSet === undefined || isSetTrackingValuesInvalid) return;

    const setTrackingValuesNumber = ConvertSetInputValuesToNumbers(
      setTrackingValuesInput
    );

    const updatedActiveSet: WorkoutSet = {
      ...activeSet,
      weight: setTrackingValuesNumber.weight,
      reps: setTrackingValuesNumber.reps,
      time_in_seconds: timeInSeconds,
      distance: setTrackingValuesNumber.distance,
      rir: setTrackingValuesNumber.rir,
      rpe: setTrackingValuesNumber.rpe,
      resistance_level: setTrackingValuesNumber.resistance_level,
      partial_reps: setTrackingValuesNumber.partial_reps,
      user_weight: setTrackingValuesNumber.user_weight,
      addCalculationTrigger: undefined,
    };

    saveActiveSet(updatedActiveSet);

    setIsSetEdited(false);
  };

  const handleClearButton = () => {
    if (activeSet === undefined) return;

    clearSetInputValues();

    const updatedActiveSet = { ...activeSet, time_in_seconds: 0 };

    setActiveSet(updatedActiveSet);

    if (activeSet.is_completed) setIsSetEdited(true);
  };

  useEffect(() => {
    if (activeSet === undefined) return;

    assignSetTrackingValuesInputs(activeSet);
    setUneditedSet({ ...activeSet });
    setIsSetEdited(false);

    // TODO: ADD NOTE INPUT?
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSet?.id]);

  useEffect(() => {
    // Change inputs when addCalculationResult function from useWorkoutActions adds calculation value
    if (
      activeSet === undefined ||
      activeSet.addCalculationTrigger === undefined
    )
      return;

    assignSetTrackingValuesInputs(activeSet);

    if (!isSetEdited) setIsSetEdited(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSet?.addCalculationTrigger]);

  return (
    <div>
      {activeSet !== undefined && (
        <div
          className={
            isActiveSetExpanded
              ? "fixed bottom-0 top-16 w-[400px] rounded-lg bg-white border-3 border-yellow-300 active-set-animation-expand"
              : "fixed bottom-0 h-20 w-[400px] rounded-lg bg-white border-3 border-yellow-300 active-set-animation-shrink"
          }
        >
          <div className="flex flex-col h-full">
            <button
              className="flex h-[4.5rem] w-full cursor-pointer rounded hover:bg-amber-50"
              onClick={() => setIsActiveSetExpanded(!isActiveSetExpanded)}
            >
              <div className="flex justify-between w-full px-3 py-2 items-center">
                <div className="flex flex-col items-start">
                  <div className="flex gap-1.5 text-2xl font-semibold">
                    <span className="text-yellow-500 max-w-[21rem] truncate">
                      {activeSet.exercise_name}{" "}
                    </span>
                    {activeSet.is_warmup === 1 && (
                      <span className="text-stone-300">(Warmup)</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 items-baseline text-base font-medium justify-between w-80">
                    <span className="text-stone-500">
                      {activeGroupedSet?.isMultiset
                        ? `Superset Set ${setCounter}`
                        : `Set ${activeSet.set_index! + 1}`}
                    </span>
                    {activeSet.time_completed !== null && (
                      <div className="text-slate-500 text-sm">
                        {userSettings.show_timestamp_on_completed_set === 1 ? (
                          <>
                            Completed at{" "}
                            <span className="font-semibold">
                              {ConvertDateStringToTimeString(
                                activeSet.time_completed,
                                userSettings.clock_style === "24h"
                              )}
                            </span>
                          </>
                        ) : (
                          "Completed"
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <ChevronIcon
                    size={34}
                    color="#eab308"
                    direction={isActiveSetExpanded ? "down" : "up"}
                  />
                </div>
              </div>
            </button>
            {isActiveSetExpanded ? (
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="flex flex-col">
                  <div className="flex flex-col">
                    <div className="flex justify-between gap-1.5">
                      <div className="px-3">
                        {activeSetNote !== undefined && (
                          <div className="flex gap-2.5 items-center pt-1.5">
                            <h3 className="font-medium">
                              {activeSetNote.note_type}
                            </h3>
                            <Button
                              className="h-7"
                              size="sm"
                              variant="flat"
                              onPress={() => setActiveSetNote(undefined)}
                            >
                              Hide
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex">
                        <Button
                          aria-label="Toggle Active Set Comment"
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() =>
                            handleToggleSetCommentButton(
                              activeSet,
                              activeSet.set_index!,
                              activeGroupedSet!
                            )
                          }
                        >
                          <CommentIcon size={20} />
                        </Button>
                        <Dropdown shouldBlockScroll={false}>
                          <DropdownTrigger>
                            <Button
                              aria-label="Toggle Active Set Options Menu"
                              isIconOnly
                              variant="light"
                              size="sm"
                              isDisabled={
                                activeSet.comment === null &&
                                activeGroupedSet?.exerciseList[exerciseIndex]
                                  .note === null &&
                                activeSet.note === null
                              }
                            >
                              <VerticalMenuIcon size={18} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="Active Set Options Menu"
                            onAction={(key) =>
                              handleActiveSetOptionSelection(key as string)
                            }
                          >
                            <DropdownItem
                              className={activeSetNote ? "" : "hidden"}
                              key="hide-note"
                            >
                              Hide Note
                            </DropdownItem>
                            <DropdownItem
                              className={
                                activeSet.note === null ? "hidden" : ""
                              }
                              key="show-set-note"
                            >
                              Show Set Note
                            </DropdownItem>
                            <DropdownItem
                              className={
                                activeGroupedSet?.exerciseList[exerciseIndex]
                                  .note === null
                                  ? "hidden"
                                  : ""
                              }
                              key="show-exercise-note"
                            >
                              Show Exercise Note
                            </DropdownItem>
                            <DropdownItem
                              className={
                                activeSet.comment === null ? "hidden" : ""
                              }
                              key="show-set-comment"
                            >
                              Show Set Comment
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                    {activeSetNote !== undefined && (
                      <div className="flex flex-col px-3 pb-1.5">
                        <div className="text-stone-500 break-words text-sm">
                          {activeSetNote.note}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col border-y divide-y divide-stone-200">
                    <SetList
                      groupedSet={activeGroupedSet!}
                      activeSetId={activeSet.id}
                      clickSetAction={handleClickSet}
                      optionsSelectionAction={handleSetOptionSelection}
                      clickCommentButtonAction={updateShownSetListComments}
                      shownSetListComments={shownSetListComments}
                      isTemplate={false}
                      handleToggleSetCommentButton={
                        handleToggleSetCommentButton
                      }
                    />
                  </div>
                  {activeGroupedSet?.exerciseList[exerciseIndex].isInvalid ? (
                    <div className="flex flex-col p-5 justify-center gap-3">
                      <div className="flex justify-center text-lg text-center font-medium">
                        This Set is referencing an Exercise that has been
                        deleted.
                      </div>
                      <Button
                        className="font-medium"
                        variant="flat"
                        onPress={() =>
                          handleReassignExercise(activeGroupedSet, activeSet)
                        }
                      >
                        Reassign Exercise
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 py-3 px-1.5">
                      <SetValueInputs
                        operatingSet={activeSet}
                        setOperatingSet={
                          setActiveSet as React.Dispatch<
                            React.SetStateAction<WorkoutSet>
                          >
                        }
                        useSetTrackingInputs={activeSetInputs}
                        userSettings={userSettings}
                        populateUserWeightValues={populateUserWeightValues}
                        exercise={activeGroupedSet?.exerciseList[exerciseIndex]}
                        isActiveSet={true}
                        openCalculationModal={openCalculationModal}
                        showGetUserWeightButton={showGetUserWeightButton}
                        showOldUserWeightLabel={showOldUserWeightLabel}
                        setShowOldUserWeightLabel={setShowOldUserWeightLabel}
                        userWeight={userWeight}
                      />
                      <div className="flex justify-between">
                        <div className="flex gap-1">
                          <Button
                            variant="light"
                            color="primary"
                            onPress={() =>
                              handleEditSet(
                                activeSet,
                                activeSet.set_index!,
                                activeGroupedSet!.exerciseList[exerciseIndex],
                                activeGroupedSet!
                              )
                            }
                          >
                            Edit Set
                          </Button>
                        </div>
                        <div className="flex gap-1.5">
                          {isSetEdited && activeSet.is_completed === 1 && (
                            <Button
                              variant="light"
                              onPress={resetSetInputValues}
                            >
                              Reset
                            </Button>
                          )}
                          <Button
                            variant="light"
                            onPress={handleClearButton}
                            isDisabled={areInputsEmpty}
                          >
                            Clear
                          </Button>
                          <Button
                            color="primary"
                            isDisabled={isSetTrackingValuesInvalid}
                            onPress={handleSaveButton}
                          >
                            {activeSet.is_completed ? "Update" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 right-1">
                  <Button
                    aria-label="Expand Or Shrink Active Set"
                    isIconOnly
                    size="lg"
                    variant="light"
                    onPress={() => setIsActiveSetExpanded(false)}
                  >
                    <MinimizeIcon color="#eab308" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
