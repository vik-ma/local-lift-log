import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
  Select,
  SelectItem,
  SharedSelection,
} from "@nextui-org/react";
import {
  UseRoutineListReturnType,
  UserSettings,
  UseWorkoutTemplateListReturnType,
} from "../../typings";
import { useMemo, useState } from "react";
import { WorkoutTemplateModalList } from "..";

type FilterRoutineListModalProps = {
  useRoutineList: UseRoutineListReturnType;
  useWorkoutTemplateList: UseWorkoutTemplateListReturnType;
  userSettings: UserSettings;
};

type ModalPage = "base" | "workout-template-list";

export const FilterRoutineListModal = ({
  useRoutineList,
  useWorkoutTemplateList,
  userSettings,
}: FilterRoutineListModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const { listFilters, filterRoutineListModal } = useRoutineList;

  const {
    filterWorkoutTemplates,
    setFilterWorkoutTemplates,
    handleClickWorkoutTemplate,
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
    filterWorkoutTemplatesString,
    routineScheduleTypes,
    filterScheduleTypes,
    setFilterScheduleTypes,
  } = listFilters;

  const showClearAllButton = useMemo(() => {
    if (
      modalPage === "workout-template-list" &&
      filterWorkoutTemplates.size > 0
    ) {
      return true;
    }

    return false;
  }, [filterWorkoutTemplates, modalPage]);

  const handleClearAllButton = () => {
    if (modalPage === "workout-template-list") {
      setFilterWorkoutTemplates(new Set());
    }
  };

  return (
    <Modal
      isOpen={filterRoutineListModal.isOpen}
      onOpenChange={filterRoutineListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "workout-template-list"
                ? "Select Workout Templates To Filter"
                : "Filter Routines"}
            </ModalHeader>
            <ModalBody>
              {modalPage === "workout-template-list" ? (
                <WorkoutTemplateModalList
                  useWorkoutTemplateList={useWorkoutTemplateList}
                  onClickAction={handleClickWorkoutTemplate}
                  filterWorkoutTemplates={filterWorkoutTemplates}
                />
              ) : (
                <ScrollShadow className="h-[400px]">
                  <div className="flex flex-col gap-3 w-[24rem]">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-lg px-0.5">
                        Schedule Types
                      </h3>
                      <Select
                        selectionMode="multiple"
                        label={
                          <>
                            Schedule Types
                            {filterScheduleTypes.size < 2 && (
                              <span className="text-secondary">
                                {" "}
                                ({filterScheduleTypes.size} out of{" "}
                                {filterScheduleTypes.size})
                              </span>
                            )}
                          </>
                        }
                        variant="faded"
                        selectedKeys={filterScheduleTypes}
                        onSelectionChange={
                          setFilterScheduleTypes as React.Dispatch<
                            React.SetStateAction<SharedSelection>
                          >
                        }
                        disableAnimation
                        disallowEmptySelection
                      >
                        {routineScheduleTypes.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
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
                            filterRoutineListModal
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