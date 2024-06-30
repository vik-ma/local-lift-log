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
import { SetValueInputs } from "../";
import { SearchIcon, CommentIcon } from "../../assets";
import {
  Exercise,
  UserSettings,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
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
  useSetTrackingInputs: UseSetTrackingInputsReturnType;
  isSetTrackingValuesInvalid: boolean;
  handleSaveSetButton: (numSets: string) => void;
  clearSetInputValues: (isOperatingSet: boolean) => void;
  userSettings: UserSettings;
};

export const SetModal = ({
  setModal,
  selectedExercise,
  setSelectedExercise,
  handleClickExercise,
  operationType,
  operatingSet,
  setOperatingSet,
  useSetTrackingInputs,
  isSetTrackingValuesInvalid,
  handleSaveSetButton,
  clearSetInputValues,
  userSettings,
}: SetModalProps) => {
  const [showDefaultValues, setShowDefaultValues] = useState<boolean>(false);
  const [numNewSets, setNumNewSets] = useState<string>("1");
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);

  const numSetsOptions = useNumSetsOptions();

  const { filterQuery, setFilterQuery, filteredExercises } = useExerciseList();

  return (
    <Modal isOpen={setModal.isOpen} onOpenChange={setModal.onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
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
                        <span className="text-xs text-stone-400 text-left">
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
                      <div className="flex gap-1 max-w-[21rem]">
                        <span className="text-yellow-600 truncate">
                          {selectedExercise.name}
                        </span>
                        <Button
                          aria-label="Toggle Set Note Input"
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => setShowNoteInput((prev) => !prev)}
                        >
                          <CommentIcon size={21} />
                        </Button>
                      </div>
                      {operationType === "edit" && (
                        <span className="text-lg text-stone-500">
                          Set {operatingSet.set_index! + 1}
                        </span>
                      )}
                    </h2>
                  </div>
                  <ScrollShadow className="flex flex-col gap-2 h-full">
                    {showNoteInput && (
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
                    )}
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
                        isSelected={
                          operatingSet.is_tracking_partial_reps ? true : false
                        }
                        onValueChange={(value) =>
                          setOperatingSet((prev) => ({
                            ...prev,
                            is_tracking_partial_reps: value ? 1 : 0,
                          }))
                        }
                      >
                        Partial Reps
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
                    <div className="flex gap-4 items-center px-0.5">
                      <h3 className="text-xl font-semibold">Default Values</h3>
                      <div className="flex flex-grow justify-between">
                        <Button
                          variant="flat"
                          size="sm"
                          onPress={() =>
                            setShowDefaultValues(!showDefaultValues)
                          }
                        >
                          {showDefaultValues ? "Hide" : "Show"}
                        </Button>
                        {showDefaultValues && (
                          <Button
                            variant="flat"
                            size="sm"
                            color="danger"
                            onPress={() => clearSetInputValues(true)}
                          >
                            Clear Default Values
                          </Button>
                        )}
                      </div>
                    </div>
                    {showDefaultValues && (
                      <SetValueInputs
                        operatingSet={operatingSet}
                        setOperatingSet={setOperatingSet}
                        useSetTrackingInputs={useSetTrackingInputs}
                        userSettings={userSettings}
                      />
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
                    selectedExercise === undefined || isSetTrackingValuesInvalid
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
