import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { UseDisclosureReturnType, Workout } from "../../typings";
import { ConvertEmptyStringToNull } from "../../helpers";
import { InfoIcon } from "../../assets";

type WorkoutModalProps = {
  workoutModal: UseDisclosureReturnType;
  workout: Workout;
  workoutNote: string;
  setWorkoutNote: React.Dispatch<React.SetStateAction<string>>;
  workoutTemplateNote: string | null;
  buttonAction: (updatedWorkout: Workout) => void;
  header?: string;
  handleChangeWorkoutTemplateButton?: () => void;
  handleRemoveWorkoutTemplateButton?: () => void;
  handleReassignWorkoutTemplateButton?: () => void;
  handleChangeRoutineButton?: () => void;
  handleRemoveRoutineButton?: () => void;
  handleReassignRoutineButton?: () => void;
};

export const WorkoutModal = ({
  workoutModal,
  workout,
  workoutNote,
  setWorkoutNote,
  workoutTemplateNote,
  buttonAction,
  header = "Workout Details",
  handleChangeWorkoutTemplateButton,
  handleRemoveWorkoutTemplateButton,
  handleReassignWorkoutTemplateButton,
  handleChangeRoutineButton,
  handleRemoveRoutineButton,
  handleReassignRoutineButton,
}: WorkoutModalProps) => {
  const handleSaveButton = () => {
    const noteToInsert = ConvertEmptyStringToNull(workoutNote);

    const updatedWorkout: Workout = { ...workout, note: noteToInsert };

    buttonAction(updatedWorkout);
  };

  return (
    <Modal
      isOpen={workoutModal.isOpen}
      onOpenChange={workoutModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2.5 h-[440px]">
                {workoutTemplateNote && (
                  <div className="flex flex-col px-0.5">
                    <h3 className="font-medium text-secondary">
                      Workout Template Note
                    </h3>
                    <span className="break-all text-sm text-stone-500 max-h-40 overflow-hidden">
                      {workoutTemplateNote}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium px-0.5">Workout Note</h3>
                  <Input
                    aria-label="Workout Note Input"
                    value={workoutNote}
                    variant="faded"
                    onValueChange={(value) => setWorkoutNote(value)}
                    isClearable
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  {handleChangeWorkoutTemplateButton !== undefined &&
                    handleRemoveWorkoutTemplateButton !== undefined && (
                      <div className="flex flex-col px-0.5">
                        <div className="flex items-center gap-px">
                          <h3 className="font-medium">Workout Template</h3>
                          <Popover placement="top" offset={4} showArrow>
                            <PopoverTrigger>
                              <Button size="sm" variant="light" isIconOnly>
                                <InfoIcon size={18} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="px-1 py-2 max-w-[330px]">
                                <div className="text-tiny">
                                  Changing the Workout Template here does not
                                  add or remove sets from the Workout. It only
                                  affects how the Workout is categorized when
                                  searching.
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex pl-px justify-between items-center">
                          {workout.workoutTemplate !== undefined ? (
                            <>
                              <span className="w-[15.5rem] truncate text-sm text-secondary">
                                {workout.workoutTemplate.name}
                              </span>
                              <div className="flex gap-0.5">
                                <Button
                                  variant="flat"
                                  size="sm"
                                  onPress={handleChangeWorkoutTemplateButton}
                                >
                                  Change
                                </Button>
                                <Button
                                  variant="flat"
                                  size="sm"
                                  color="danger"
                                  onPress={handleRemoveWorkoutTemplateButton}
                                >
                                  Remove
                                </Button>
                              </div>
                            </>
                          ) : workout.hasInvalidWorkoutTemplate &&
                            handleReassignWorkoutTemplateButton !==
                              undefined ? (
                            <>
                              <span className="text-red-700 text-sm">
                                Unknown Workout Template
                              </span>
                              <Button
                                variant="flat"
                                size="sm"
                                color="secondary"
                                onPress={handleReassignWorkoutTemplateButton}
                              >
                                Reassign
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-stone-400 text-sm">
                                No Workout Template
                              </span>
                              <Button
                                variant="flat"
                                size="sm"
                                onPress={handleChangeWorkoutTemplateButton}
                              >
                                Add
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  {handleChangeRoutineButton !== undefined &&
                    handleRemoveRoutineButton !== undefined && (
                      <div className="flex flex-col px-0.5">
                        <div className="flex items-center gap-px">
                          <h3 className="font-medium">Routine</h3>
                          <Popover placement="top" offset={4} showArrow>
                            <PopoverTrigger>
                              <Button size="sm" variant="light" isIconOnly>
                                <InfoIcon size={18} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="px-1 py-2 max-w-[330px]">
                                <div className="text-tiny">
                                  Changing the Routine here does not modify any
                                  existing Routines. It only affects how the
                                  Workout is categorized when searching.
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex pl-px justify-between items-center">
                          {workout.routine !== undefined ? (
                            <>
                              <span className="w-[15.5rem] truncate text-sm text-secondary">
                                {workout.routine.name}
                              </span>
                              <div className="flex gap-0.5">
                                <Button
                                  variant="flat"
                                  size="sm"
                                  onPress={handleChangeRoutineButton}
                                >
                                  Change
                                </Button>
                                <Button
                                  variant="flat"
                                  size="sm"
                                  color="danger"
                                  onPress={handleRemoveRoutineButton}
                                >
                                  Remove
                                </Button>
                              </div>
                            </>
                          ) : workout.hasInvalidRoutine &&
                            handleReassignRoutineButton !== undefined ? (
                            <>
                              <span className="text-red-700 text-sm">
                                Unknown Routine
                              </span>
                              <Button
                                variant="flat"
                                size="sm"
                                color="secondary"
                                onPress={handleReassignRoutineButton}
                              >
                                Reassign
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-stone-400 text-sm">
                                No Routine
                              </span>
                              <Button
                                variant="flat"
                                size="sm"
                                onPress={handleChangeRoutineButton}
                              >
                                Add
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleSaveButton}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
