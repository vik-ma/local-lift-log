import {
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { ConvertDateStringToTimeString } from "../helpers";
import {
  ChevronIcon,
  CommentIcon,
  VerticalMenuIcon,
  MinimizeIcon,
} from "../assets";
import {
  SetList,
  WeightUnitDropdown,
  DistanceUnitDropdown,
  TimeInput,
} from ".";
import {
  GroupedWorkoutSet,
  SetTrackingValuesInput,
  SetWorkoutSetAction,
  UserSettings,
  WorkoutSet,
  ActiveSetNote,
  Exercise,
  SetListNotes,
  SetListOptionsItem,
} from "../typings";
import { useSetTrackingInputs } from "../hooks";

type ActiveSetProps = {
  activeSet: WorkoutSet | undefined;
  setActiveSet: React.Dispatch<React.SetStateAction<WorkoutSet | undefined>>;
  isActiveSetExpanded: boolean;
  setIsActiveSetExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  userSettings: UserSettings;
  activeGroupedSet: GroupedWorkoutSet | undefined;
  handleReassignExercise: (groupedWorkoutSet: GroupedWorkoutSet) => void;
  handleActiveSetOptionSelection: (key: string) => void;
  showCommentInput: boolean;
  setShowCommentInput: React.Dispatch<React.SetStateAction<boolean>>;
  activeSetNote: ActiveSetNote | undefined;
  setActiveSetNote: React.Dispatch<
    React.SetStateAction<ActiveSetNote | undefined>
  >;
  handleClickSet: (set: WorkoutSet, index: number, exercise: Exercise) => void;
  handleSetOptionSelection: (
    key: string,
    set: WorkoutSet,
    index: number,
    exercise: Exercise
  ) => void;
  updateShownSetListComments: (exerciseId: number, index: number) => void;
  shownSetListComments: SetListNotes;
  setListOptionsMenu: SetListOptionsItem[];
  activeSetInputs: ReturnType<typeof useSetTrackingInputs>;
  handleEditSet: (set: WorkoutSet, index: number, exercise: Exercise) => void;
  clearSetInputValues: (isOperatingSet: boolean) => void;
  saveActiveSet: () => void;
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
  showCommentInput,
  setShowCommentInput,
  activeSetNote,
  setActiveSetNote,
  handleClickSet,
  handleSetOptionSelection,
  updateShownSetListComments,
  shownSetListComments,
  setListOptionsMenu,
  activeSetInputs,
  handleEditSet,
  clearSetInputValues,
  saveActiveSet,
}: ActiveSetProps) => {
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
                      <span className="text-lime-300">(Warmup)</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 text-lg font-medium justify-between w-80">
                    <span className="text-stone-500">
                      Set {activeSet.set_index! + 1}
                    </span>
                    {activeSet.time_completed !== null && (
                      <div className="text-lg text-success">
                        {userSettings?.show_timestamp_on_completed_set === 1 ? (
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
                {activeGroupedSet?.exercise.isInvalid ? (
                  <div className="flex flex-col p-5 justify-center gap-3">
                    <div className="flex justify-center text-lg text-center font-medium">
                      This Set is referencing an Exercise that has been deleted.
                    </div>
                    <Button
                      className="font-medium"
                      variant="flat"
                      onPress={() => handleReassignExercise(activeGroupedSet)}
                    >
                      Reassign Exercise
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <div className="flex justify-between gap-1.5">
                        <div>
                          {showCommentInput && (
                            <Input
                              value={activeSet.comment ?? ""}
                              label="Comment"
                              labelPlacement="outside-left"
                              size="sm"
                              variant="faded"
                              onValueChange={(value) =>
                                setActiveSet((prev) => ({
                                  ...prev!,
                                  comment: value,
                                }))
                              }
                              isClearable
                            />
                          )}
                          {activeSetNote !== undefined && (
                            <div className="flex gap-2 items-center pt-1.5">
                              <h3 className="font-medium text-lg">
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
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => setShowCommentInput((prev) => !prev)}
                          >
                            <CommentIcon size={20} />
                          </Button>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                isDisabled={
                                  activeSet.comment === null &&
                                  activeGroupedSet?.exercise.note === null &&
                                  activeSet.note === null
                                }
                              >
                                <VerticalMenuIcon size={18} />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Active Set Option Menu"
                              itemClasses={{
                                base: "hover:text-[#404040] gap-4",
                              }}
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
                                  activeGroupedSet?.exercise.note === null
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
                        <div className="flex flex-col">
                          <div className="text-stone-500 break-words">
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
                        setListOptionsMenu={setListOptionsMenu}
                      />
                    </div>
                    <div className="px-1.5">
                      <div className="flex flex-wrap gap-1.5 justify-evenly pt-2">
                        {!!activeSet.is_tracking_weight && (
                          <div className="flex justify-between gap-2 w-56">
                            <Input
                              value={
                                activeSetInputs.setTrackingValuesInput.weight
                              }
                              label="Weight"
                              variant="faded"
                              labelPlacement="outside-left"
                              onValueChange={(value) =>
                                activeSetInputs.setSetTrackingValuesInput(
                                  (prev: SetTrackingValuesInput) => ({
                                    ...prev,
                                    weight: value,
                                  })
                                )
                              }
                              isInvalid={
                                activeSetInputs.setInputsValidityMap.weight
                              }
                              isClearable
                            />
                            <WeightUnitDropdown
                              value={activeSet.weight_unit}
                              setSet={setActiveSet as SetWorkoutSetAction}
                              targetType="set"
                            />
                          </div>
                        )}
                        {!!activeSet.is_tracking_reps && (
                          <Input
                            className="w-28"
                            value={activeSetInputs.setTrackingValuesInput.reps}
                            label="Reps"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              activeSetInputs.setSetTrackingValuesInput(
                                (prev: SetTrackingValuesInput) => ({
                                  ...prev,
                                  reps: value,
                                })
                              )
                            }
                            isInvalid={
                              activeSetInputs.setInputsValidityMap.reps
                            }
                            isClearable
                          />
                        )}
                        {!!activeSet.is_tracking_distance && (
                          <div className="flex justify-between gap-2 w-64">
                            <Input
                              value={
                                activeSetInputs.setTrackingValuesInput.distance
                              }
                              label="Distance"
                              variant="faded"
                              labelPlacement="outside-left"
                              onValueChange={(value) =>
                                activeSetInputs.setSetTrackingValuesInput(
                                  (prev: SetTrackingValuesInput) => ({
                                    ...prev,
                                    distance: value,
                                  })
                                )
                              }
                              isInvalid={
                                activeSetInputs.setInputsValidityMap.distance
                              }
                              isClearable
                            />
                            <DistanceUnitDropdown
                              value={activeSet.distance_unit}
                              setSet={setActiveSet as SetWorkoutSetAction}
                              targetType="set"
                            />
                          </div>
                        )}
                        {!!activeSet.is_tracking_time && (
                          <TimeInput
                            value={activeSet}
                            setValue={setActiveSet as SetWorkoutSetAction}
                            defaultTimeInput={userSettings!.default_time_input!}
                            setIsInvalid={activeSetInputs.setIsTimeInputInvalid}
                            time_input_behavior_hhmmss={
                              userSettings!.time_input_behavior_hhmmss!
                            }
                            time_input_behavior_mmss={
                              userSettings!.time_input_behavior_mmss!
                            }
                          />
                        )}
                        {!!activeSet.is_tracking_rir && (
                          <Input
                            className="w-[6.5rem]"
                            value={activeSetInputs.setTrackingValuesInput.rir}
                            label="RIR"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              activeSetInputs.setSetTrackingValuesInput(
                                (prev: SetTrackingValuesInput) => ({
                                  ...prev,
                                  rir: value,
                                })
                              )
                            }
                            isInvalid={activeSetInputs.setInputsValidityMap.rir}
                            isClearable
                          />
                        )}
                        {!!activeSet.is_tracking_rpe && (
                          <Input
                            className="w-[6.5rem]"
                            value={activeSetInputs.setTrackingValuesInput.rpe}
                            label="RPE"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              activeSetInputs.setSetTrackingValuesInput(
                                (prev: SetTrackingValuesInput) => ({
                                  ...prev,
                                  rpe: value,
                                })
                              )
                            }
                            isInvalid={activeSetInputs.setInputsValidityMap.rpe}
                            isClearable
                          />
                        )}
                        {!!activeSet.is_tracking_resistance_level && (
                          <Input
                            className="w-auto"
                            classNames={{
                              label: "whitespace-nowrap",
                              input: "w-16",
                            }}
                            value={
                              activeSetInputs.setTrackingValuesInput
                                .resistance_level
                            }
                            label="Resistance Level"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              activeSetInputs.setSetTrackingValuesInput(
                                (prev: SetTrackingValuesInput) => ({
                                  ...prev,
                                  resistance_level: value,
                                })
                              )
                            }
                            isInvalid={
                              activeSetInputs.setInputsValidityMap
                                .resistance_level
                            }
                            isClearable
                          />
                        )}
                      </div>
                      <div className="flex justify-between pt-3">
                        <div className="flex gap-1">
                          <Button
                            color="success"
                            variant="light"
                            onPress={() =>
                              handleEditSet(
                                activeSet,
                                activeSet.set_index!,
                                activeGroupedSet!.exercise
                              )
                            }
                          >
                            Edit Set
                          </Button>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            color="success"
                            variant="light"
                            onPress={() => clearSetInputValues(false)}
                          >
                            Clear
                          </Button>
                          <Button
                            color="success"
                            isDisabled={
                              activeSetInputs.isSetTrackingValuesInvalid
                            }
                            onPress={saveActiveSet}
                          >
                            {activeSet.is_completed ? "Update" : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-1 right-1">
                  <Button
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