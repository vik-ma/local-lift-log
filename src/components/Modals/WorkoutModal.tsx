import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@nextui-org/react";
import { UseDisclosureReturnType, Workout } from "../../typings";
import { ConvertEmptyStringToNull } from "../../helpers";
import { useState } from "react";
import { ChevronIcon } from "../../assets";
import { AnimatePresence, motion } from "framer-motion";
import { WorkoutRatingSliders } from "../../components";

type WorkoutModalProps = {
  workoutModal: UseDisclosureReturnType;
  workout: Workout;
  setWorkout: React.Dispatch<React.SetStateAction<Workout>>;
  workoutNote: string;
  setWorkoutNote: React.Dispatch<React.SetStateAction<string>>;
  workoutTemplateNote: string | null;
  workoutRatingsOrder: string;
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
  workoutRatingsOrder,
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
                      className="flex relative cursor-pointer w-[23.75rem] pb-0.5"
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
                          className="pt-5"
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.1 },
                            opacity: { duration: 0.05 },
                          }}
                        >
                          <div className="flex flex-col gap-4 w-[23.25rem] px-4">
                            <WorkoutRatingSliders
                              workout={workout}
                              setWorkout={setWorkout}
                              workoutRatingsOrder={workoutRatingsOrder}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {handleChangeWorkoutTemplateButton !== undefined && (
                    <div className="flex flex-col gap-0.5 px-0.5">
                      <span className="font-medium">Workout Template</span>
                      <div className="flex justify-between items-center">
                        {workout.workoutTemplate !== undefined ? (
                          <>
                            <span className="w-[19rem] break-all text-sm text-secondary">
                              {workout.workoutTemplate.name}
                            </span>
                            <Button
                              variant="flat"
                              size="sm"
                              onPress={handleChangeWorkoutTemplateButton}
                            >
                              Change
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-stone-400 text-sm">
                              No Workout Template
                            </span>
                            {/* TODO: ADD ADD BUTTON */}
                          </>
                        )}
                      </div>
                    </div>
                  )}
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
