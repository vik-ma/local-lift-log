import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Input,
  ScrollShadow,
  Checkbox,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { WeightUnitDropdown, DistanceUnitDropdown, TimeInput } from "../";
import { SearchIcon } from "../../assets";
import {
  Exercise,
  SetTrackingValuesInput,
  SetTrackingValuesValidity,
  SetWorkoutSetAction,
  WorkoutSet,
} from "../../typings";
import { useState } from "react";
import { useExerciseList, useNumSetsOptions } from "../../hooks";

type SetModalProps = {
  setModal: ReturnType<typeof useDisclosure>;
  selectedExercise: Exercise | undefined;
  setSelectedExercise: React.Dispatch<
    React.SetStateAction<Exercise | undefined>
  >;
  handleClickExercise: (exercise: Exercise) => void;
  operationType: string;
  operatingSet: WorkoutSet;
  setOperatingSet: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  setTrackingValuesInput: SetTrackingValuesInput;
  setSetTrackingValuesInput: React.Dispatch<
    React.SetStateAction<SetTrackingValuesInput>
  >;
  setInputsValidityMap: SetTrackingValuesValidity;
  isSetDefaultValuesInvalid: boolean;
  handleSaveSetButton: (numSets: string) => void;
  setIsTimeInputInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  defaultTimeInput: string;
  time_input_behavior_hhmmss: string;
  time_input_behavior_mmss: string;
};

export const SetModal = ({
  setModal,
  selectedExercise,
  setSelectedExercise,
  handleClickExercise,
  operationType,
  operatingSet,
  setOperatingSet,
  setTrackingValuesInput,
  setSetTrackingValuesInput,
  setInputsValidityMap,
  isSetDefaultValuesInvalid,
  handleSaveSetButton,
  setIsTimeInputInvalid,
  defaultTimeInput,
  time_input_behavior_hhmmss,
  time_input_behavior_mmss,
}: SetModalProps) => {
  const [showDefaultValues, setShowDefaultValues] = useState<boolean>(false);
  const [numNewSets, setNumNewSets] = useState<string>("1");

  const numSetsOptions = useNumSetsOptions();

  const { filterQuery, setFilterQuery, filteredExercises } = useExerciseList();

  return (
    <Modal isOpen={setModal.isOpen} onOpenChange={setModal.onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {selectedExercise === undefined
                ? "Select Exercise"
                : "Tracking Options"}
            </ModalHeader>
            <ModalBody>
              {selectedExercise === undefined ? (
                <div className="h-[400px] flex flex-col gap-2">
                  <Input
                    label="Search"
                    variant="faded"
                    placeholder="Type to search..."
                    isClearable
                    value={filterQuery}
                    onValueChange={setFilterQuery}
                    startContent={<SearchIcon />}
                  />
                  <ScrollShadow className="flex flex-col gap-1">
                    {filteredExercises.map((exercise) => (
                      <button
                        key={exercise.id}
                        className="flex flex-col justify-start items-start bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:bg-default-200 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        onClick={() => handleClickExercise(exercise)}
                      >
                        <span className="text-md max-w-full truncate">
                          {exercise.name}
                        </span>
                        <span className="text-xs text-stone-500 text-left">
                          {exercise.formattedGroupString}
                        </span>
                      </button>
                    ))}
                  </ScrollShadow>
                </div>
              ) : (
                <div className="flex flex-col gap-2 h-[400px]">
                  <div className="flex flex-row items-center justify-between">
                    <h2 className="flex text-2xl font-semibold justify-between w-full items-end">
                      <span className="text-yellow-600 truncate max-w-[21rem]">
                        {selectedExercise.name}
                      </span>{" "}
                      {operationType === "edit" && (
                        <span className="text-lg text-stone-500">
                          Set {operatingSet.set_index! + 1}
                        </span>
                      )}
                    </h2>
                  </div>
                  <ScrollShadow className="flex flex-col gap-2 h-full">
                    <Input
                      value={operatingSet.note ?? ""}
                      label="Note"
                      variant="faded"
                      size="sm"
                      onValueChange={(value) =>
                        setOperatingSet((prev) => ({
                          ...prev,
                          note: value,
                        }))
                      }
                      isClearable
                    />
                    <h3 className="text-xl font-semibold px-0.5">Track</h3>
                    <div className="grid grid-cols-2 gap-1.5 px-1">
                      <Checkbox
                        color="success"
                        isSelected={
                          operatingSet.is_tracking_weight ? true : false
                        }
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_weight: value ? 1 : 0,
                          }))
                        }
                      >
                        Weight
                      </Checkbox>
                      <Checkbox
                        color="success"
                        isSelected={
                          operatingSet.is_tracking_reps ? true : false
                        }
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_reps: value ? 1 : 0,
                          }))
                        }
                      >
                        Reps
                      </Checkbox>
                      <Checkbox
                        color="success"
                        isSelected={
                          operatingSet.is_tracking_distance ? true : false
                        }
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_distance: value ? 1 : 0,
                          }))
                        }
                      >
                        Distance
                      </Checkbox>
                      <Checkbox
                        color="success"
                        isSelected={
                          operatingSet.is_tracking_time ? true : false
                        }
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_time: value ? 1 : 0,
                          }))
                        }
                      >
                        Time
                      </Checkbox>
                      <Checkbox
                        color="success"
                        isSelected={operatingSet.is_tracking_rir ? true : false}
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_rir: value ? 1 : 0,
                          }))
                        }
                      >
                        RIR
                      </Checkbox>
                      <Checkbox
                        color="success"
                        isSelected={operatingSet.is_tracking_rpe ? true : false}
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_rpe: value ? 1 : 0,
                          }))
                        }
                      >
                        RPE
                      </Checkbox>
                      <Checkbox
                        color="success"
                        isSelected={
                          operatingSet.is_tracking_resistance_level
                            ? true
                            : false
                        }
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_resistance_level: value ? 1 : 0,
                          }))
                        }
                      >
                        Resistance Level
                      </Checkbox>
                      <Checkbox
                        color="success"
                        isSelected={operatingSet.is_warmup ? true : false}
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_warmup: value ? 1 : 0,
                          }))
                        }
                      >
                        <span className="text-primary">Warmup Set</span>
                      </Checkbox>
                    </div>
                    {operationType === "add" && (
                      <div className="flex flex-row justify-between">
                        <Select
                          label="Number Of Sets To Add"
                          size="sm"
                          variant="faded"
                          selectedKeys={[numNewSets]}
                          onChange={(e) => setNumNewSets(e.target.value)}
                          disallowEmptySelection
                        >
                          {numSetsOptions.map((num) => (
                            <SelectItem key={num} value={num}>
                              {num}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    )}
                    <div className="flex gap-2.5 items-center px-0.5">
                      <h3 className="text-xl font-semibold">Default Values</h3>
                      <Button
                        variant="flat"
                        size="sm"
                        onPress={() => setShowDefaultValues(!showDefaultValues)}
                      >
                        {showDefaultValues ? "Hide" : "Show"}
                      </Button>
                    </div>
                    {showDefaultValues && (
                      <div className="flex flex-wrap gap-1.5 px-1 justify-evenly">
                        {!!operatingSet.is_tracking_weight && (
                          <div className="flex justify-between gap-2 w-56">
                            <Input
                              value={setTrackingValuesInput.weight}
                              label="Weight"
                              variant="faded"
                              labelPlacement="outside-left"
                              onValueChange={(value) =>
                                setSetTrackingValuesInput((prev) => ({
                                  ...prev,
                                  weight: value,
                                }))
                              }
                              isInvalid={setInputsValidityMap.weight}
                              isClearable
                            />
                            <WeightUnitDropdown
                              value={operatingSet.weight_unit}
                              setSet={setOperatingSet as SetWorkoutSetAction}
                              targetType="set"
                            />
                          </div>
                        )}
                        {!!operatingSet.is_tracking_reps && (
                          <Input
                            className="w-28"
                            value={setTrackingValuesInput.reps}
                            label="Reps"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput((prev) => ({
                                ...prev,
                                reps: value,
                              }))
                            }
                            isInvalid={setInputsValidityMap.reps}
                            isClearable
                          />
                        )}
                        {!!operatingSet.is_tracking_distance && (
                          <div className="flex justify-between gap-2 w-64">
                            <Input
                              value={setTrackingValuesInput.distance}
                              label="Distance"
                              variant="faded"
                              labelPlacement="outside-left"
                              onValueChange={(value) =>
                                setSetTrackingValuesInput((prev) => ({
                                  ...prev,
                                  distance: value,
                                }))
                              }
                              isInvalid={setInputsValidityMap.distance}
                              isClearable
                            />
                            <DistanceUnitDropdown
                              value={operatingSet.distance_unit}
                              setSet={setOperatingSet as SetWorkoutSetAction}
                              targetType="set"
                            />
                          </div>
                        )}
                        {!!operatingSet.is_tracking_time && (
                          <TimeInput
                            value={operatingSet}
                            setValue={setOperatingSet}
                            defaultTimeInput={defaultTimeInput}
                            setIsInvalid={setIsTimeInputInvalid}
                            time_input_behavior_hhmmss={
                              time_input_behavior_hhmmss
                            }
                            time_input_behavior_mmss={time_input_behavior_mmss}
                          />
                        )}
                        {!!operatingSet.is_tracking_rir && (
                          <Input
                            className="w-[6.5rem]"
                            value={setTrackingValuesInput.rir}
                            label="RIR"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput((prev) => ({
                                ...prev,
                                rir: value,
                              }))
                            }
                            isInvalid={setInputsValidityMap.rir}
                            isClearable
                          />
                        )}
                        {!!operatingSet.is_tracking_rpe && (
                          <Input
                            className="w-[6.5rem]"
                            value={setTrackingValuesInput.rpe}
                            label="RPE"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput((prev) => ({
                                ...prev,
                                rpe: value,
                              }))
                            }
                            isInvalid={setInputsValidityMap.rpe}
                            isClearable
                          />
                        )}
                        {!!operatingSet.is_tracking_resistance_level && (
                          <Input
                            className="w-auto"
                            classNames={{
                              label: "whitespace-nowrap",
                              input: "w-16",
                            }}
                            value={setTrackingValuesInput.resistance_level}
                            label="Resistance Level"
                            variant="faded"
                            labelPlacement="outside-left"
                            onValueChange={(value) =>
                              setSetTrackingValuesInput((prev) => ({
                                ...prev,
                                resistance_level: value,
                              }))
                            }
                            isInvalid={setInputsValidityMap.resistance_level}
                            isClearable
                          />
                        )}
                      </div>
                    )}
                  </ScrollShadow>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {operationType === "add" && selectedExercise !== undefined && (
                  <Button
                    variant="flat"
                    color="danger"
                    onPress={() => setSelectedExercise(undefined)}
                  >
                    Change Exercise
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  isDisabled={
                    selectedExercise === undefined || isSetDefaultValuesInvalid
                  }
                  onPress={() => handleSaveSetButton(numNewSets)}
                >
                  {operationType === "edit" ? "Save" : "Add"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SetModal;
