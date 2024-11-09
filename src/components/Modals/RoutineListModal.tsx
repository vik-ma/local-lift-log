import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
} from "@nextui-org/react";
import { Routine, UseRoutineListReturnType } from "../../typings";
import { EmptyListLabel, SearchInput } from "..";
import { FormatNumItemsString } from "../../helpers";

type RoutineListModal = {
  routineList: UseRoutineListReturnType;
  activeRoutineId: number;
  onClickAction: (routine: Routine) => void;
};

export const RoutineListModal = ({
  routineList,
  activeRoutineId,
  onClickAction,
}: RoutineListModal) => {
  const {
    routines,
    filteredRoutines,
    filterQuery,
    setFilterQuery,
    routineListModal,
  } = routineList;

  return (
    <Modal
      isOpen={routineListModal.isOpen}
      onOpenChange={routineListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Select Routine</ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-1.5">
                <SearchInput
                  filterQuery={filterQuery}
                  setFilterQuery={setFilterQuery}
                  filteredListLength={filteredRoutines.length}
                  totalListLength={routines.length}
                />
                <ScrollShadow className="flex flex-col gap-1">
                  {filteredRoutines.map((routine) => {
                    const isActiveRoutine = activeRoutineId === routine.id;
                    const numWorkoutTemplates =
                      routine.numWorkoutTemplates ?? 0;
                    return (
                      <button
                        key={routine.id}
                        className="flex justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                        onClick={() => onClickAction(routine)}
                      >
                        <div className="flex flex-col justify-start items-start pl-2 py-1">
                          <span
                            className={
                              isActiveRoutine
                                ? "w-[16.5rem] truncate text-left"
                                : "w-[23.5rem] truncate text-left"
                            }
                          >
                            {routine.name}
                          </span>
                          {numWorkoutTemplates > 0 && (
                            <span className="text-xs text-secondary text-left">
                              {FormatNumItemsString(
                                numWorkoutTemplates,
                                "Workout"
                              )}
                            </span>
                          )}
                          <span className="text-xs text-stone-400 text-left">
                            {routine.is_schedule_weekly === 0
                              ? `${routine.num_days_in_schedule} Day Schedule`
                              : "Weekly Schedule"}
                          </span>
                        </div>
                        {isActiveRoutine && (
                          <div className="pr-2">
                            <div className="flex justify-center px-1.5 py-0.5 text-sm text-success rounded-lg bg-success/10 border-2 border-success/40">
                              Active Routine
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredRoutines.length === 0 && (
                    <EmptyListLabel itemName="Routines" />
                  )}
                </ScrollShadow>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
