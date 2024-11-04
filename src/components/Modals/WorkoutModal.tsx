import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
  Slider,
} from "@nextui-org/react";
import { UseDisclosureReturnType, Workout } from "../../typings";
import { ConvertEmptyStringToNull } from "../../helpers";
import { useState } from "react";
import { ChevronIcon } from "../../assets";
import { AnimatePresence, motion } from "framer-motion";

type WorkoutModalProps = {
  workoutModal: UseDisclosureReturnType;
  workout: Workout;
  setWorkout: React.Dispatch<React.SetStateAction<Workout>>;
  workoutNote: string;
  setWorkoutNote: React.Dispatch<React.SetStateAction<string>>;
  workoutTemplateNote: string | null;
  buttonAction: (updatedWorkout: Workout) => void;
  header?: string;
  handleChangeWorkoutTemplateButton?: () => void;
};

export const WorkoutModal = ({
  workoutModal,
  workout,
  setWorkout,
  workoutNote,
  setWorkoutNote,
  workoutTemplateNote,
  buttonAction,
  header = "Workout Details",
  handleChangeWorkoutTemplateButton,
}: WorkoutModalProps) => {
  const [isRatingAccordionExpanded, setIsRatingAccordionExpanded] =
    useState<boolean>(true);

  const handleSaveButton = () => {
    const noteToInsert = ConvertEmptyStringToNull(workoutNote);

    const updatedWorkout: Workout = { ...workout, note: noteToInsert };

    buttonAction(updatedWorkout);
  };

  const handleRatingChange = (value: number, key: string) => {
    if (value < -5 || value > 5) return;

    switch (key) {
      case "general":
        setWorkout((prev) => ({
          ...prev,
          rating_general: value,
        }));
        break;
      default:
        break;
    }
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
              <ScrollShadow className="h-[440px]">
                <div className="flex flex-col gap-3.5">
                  {workoutTemplateNote && (
                    <div className="flex flex-col px-0.5">
                      <span className="font-medium text-secondary">
                        Workout Template Note
                      </span>
                      <span className="break-all text-sm text-stone-500">
                        {workoutTemplateNote}
                      </span>
                    </div>
                  )}
                  {workout.workoutTemplateName &&
                    handleChangeWorkoutTemplateButton && (
                      <div className="flex flex-col gap-0.5 px-0.5">
                        <span className="font-medium text-secondary">
                          Workout Template
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className="w-[19rem] break-all text-sm text-stone-500">
                            {workout.workoutTemplateName}
                          </span>
                          <Button
                            variant="flat"
                            size="sm"
                            onPress={handleChangeWorkoutTemplateButton}
                          >
                            Change
                          </Button>
                        </div>
                      </div>
                    )}
                  <div className="flex flex-col gap-1">
                    <span className="font-medium px-0.5">Workout Note</span>
                    <Input
                      className="w-[23.75rem]"
                      aria-label="Workout Note Input"
                      value={workoutNote}
                      variant="faded"
                      onValueChange={(value) => setWorkoutNote(value)}
                      isClearable
                    />
                  </div>
                  <div
                    aria-label="Workout Ratings Accordion"
                    className="flex flex-col select-none cursor-pointer px-0.5"
                  >
                    <div
                      className="flex relative cursor-pointer w-[23.75rem]"
                      onClick={() =>
                        setIsRatingAccordionExpanded(!isRatingAccordionExpanded)
                      }
                    >
                      <span className="font-medium">Workout Ratings</span>
                      <div className="absolute top-1 right-0">
                        <ChevronIcon
                          size={31}
                          color="#a8a29e"
                          direction={
                            isRatingAccordionExpanded ? "down" : "left"
                          }
                        />
                      </div>
                    </div>
                    <AnimatePresence>
                      {isRatingAccordionExpanded && (
                        <motion.div
                          className="pt-3"
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.1 },
                            opacity: { duration: 0.05 },
                          }}
                        >
                          <div className="flex flex-col gap-2 w-[23.25rem]">
                            <Slider
                              step={1}
                              value={workout.rating_general}
                              onChange={(value) =>
                                handleRatingChange(value as number, "general")
                              }
                              label="General"
                              maxValue={5}
                              minValue={-5}
                              fillOffset={0}
                              marks={[
                                {
                                  value: -5,
                                  label: "0",
                                },
                                {
                                  value: 5,
                                  label: "10",
                                },
                              ]}
                              getValue={(value) => `${Number(value) + 5}`}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </ScrollShadow>
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
