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
} from "@heroui/react";
import {
  ListFilterValues,
  UseFilterMinAndMaxValueInputsProps,
  UseRoutineListReturnType,
  UserSettings,
  UseWorkoutTemplateListReturnType,
  WorkoutTemplate,
} from "../../typings";
import { useEffect, useMemo, useState } from "react";
import { FilterMinAndMaxValues, WorkoutTemplateModalList } from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import {
  ConvertInputStringToNumberOrNull,
  ConvertNumberToInputString,
  HandleFilterListObjectClick,
} from "../../helpers";
import { MODAL_BODY_HEIGHT, ROUTINE_SCHEDULE_TYPES } from "../../constants";

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
  const [filterWorkoutTemplates, setFilterWorkoutTemplates] = useState<
    Set<number>
  >(new Set());
  const [filterScheduleTypes, setFilterScheduleTypes] = useState<Set<string>>(
    new Set()
  );

  const { listFilters, filterRoutineListModal } = useRoutineList;

  const filterMinAndMaxValueInputsProps: UseFilterMinAndMaxValueInputsProps = {
    minValue: 2,
    maxValue: 14,
    isIntegerOnly: true,
  };

  const filterMinAndMaxValueInputsNumScheduleDays =
    useFilterMinAndMaxValueInputs(filterMinAndMaxValueInputsProps);

  const {
    resetFilter,
    filterMap,
    handleFilterSaveButton,
    getFilterWorkoutTemplatesString,
    listFilterValues,
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

  const isFilterButtonDisabled = useMemo(() => {
    return (
      modalPage === "base" &&
      filterMinAndMaxValueInputsNumScheduleDays.isFilterInvalid
    );
  }, [modalPage, filterMinAndMaxValueInputsNumScheduleDays.isFilterInvalid]);

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (filterWorkoutTemplates.size > 0) return true;
    if (filterScheduleTypes.size > 0) return true;
    if (!filterMinAndMaxValueInputsNumScheduleDays.areInputsEmpty) return true;

    return false;
  }, [
    filterMap,
    filterWorkoutTemplates,
    filterScheduleTypes,
    filterMinAndMaxValueInputsNumScheduleDays.areInputsEmpty,
  ]);

  const filterWorkoutTemplatesString = useMemo(() => {
    return getFilterWorkoutTemplatesString(filterWorkoutTemplates);
  }, [getFilterWorkoutTemplatesString, filterWorkoutTemplates]);

  const handleClickWorkoutTemplate = (workoutTemplate: WorkoutTemplate) => {
    HandleFilterListObjectClick(
      workoutTemplate,
      filterWorkoutTemplates,
      setFilterWorkoutTemplates
    );
  };

  const handleSaveButton = () => {
    if (isFilterButtonDisabled) return;

    const filterValues: ListFilterValues = {
      ...listFilterValues,
      filterWorkoutTemplates: filterWorkoutTemplates,
      filterScheduleTypes: filterScheduleTypes,
      filterMinNumScheduleDays: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsNumScheduleDays.minInput
      ),
      filterMaxNumScheduleDays: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsNumScheduleDays.maxInput
      ),
      includeNullInMaxValues:
        filterMinAndMaxValueInputsNumScheduleDays.includeNullInMaxValues,
    };

    handleFilterSaveButton(
      userSettings.locale,
      filterValues,
      filterRoutineListModal
    );
  };

  useEffect(() => {
    setFilterWorkoutTemplates(listFilterValues.filterWorkoutTemplates);
    setFilterScheduleTypes(listFilterValues.filterScheduleTypes);
    filterMinAndMaxValueInputsNumScheduleDays.setIncludeNullInMaxValues(
      listFilterValues.includeNullInMaxValues
    );
    filterMinAndMaxValueInputsNumScheduleDays.setMinInput(
      ConvertNumberToInputString(listFilterValues.filterMinNumScheduleDays)
    );
    filterMinAndMaxValueInputsNumScheduleDays.setMaxInput(
      ConvertNumberToInputString(listFilterValues.filterMaxNumScheduleDays)
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilterValues]);

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
            <ModalBody className="py-0">
              {modalPage === "workout-template-list" ? (
                <WorkoutTemplateModalList
                  useWorkoutTemplateList={useWorkoutTemplateList}
                  onClickAction={handleClickWorkoutTemplate}
                  filterWorkoutTemplates={filterWorkoutTemplates}
                />
              ) : (
                <ScrollShadow className={`${MODAL_BODY_HEIGHT}`}>
                  <div className="flex flex-col gap-2 w-[24rem]">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-lg px-0.5">
                        Schedule Types
                      </h3>
                      <Select
                        selectionMode="multiple"
                        label={
                          <>
                            Schedule Types
                            {filterScheduleTypes.size > 0 && (
                              <span className="text-secondary">
                                {" "}
                                ({filterScheduleTypes.size} out of{" "}
                                {ROUTINE_SCHEDULE_TYPES.length})
                              </span>
                            )}
                          </>
                        }
                        variant="faded"
                        size="sm"
                        radius="md"
                        selectedKeys={filterScheduleTypes}
                        onSelectionChange={
                          setFilterScheduleTypes as React.Dispatch<
                            React.SetStateAction<SharedSelection>
                          >
                        }
                        disableAnimation
                      >
                        {ROUTINE_SCHEDULE_TYPES.map((value) => (
                          <SelectItem key={value}>{value}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col pt-4">
                      <h3 className="text-lg font-semibold px-0.5">
                        Number Of Days In Schedule{" "}
                        <span className="text-default-500 text-sm">
                          (2 – 14)
                        </span>
                      </h3>
                      <FilterMinAndMaxValues
                        label="Days"
                        useFilterMinAndMaxValueInputs={
                          filterMinAndMaxValueInputsNumScheduleDays
                        }
                        isSmall
                        customIncludeNullCheckboxLabel={
                          "Include routines with no set days (Max only)"
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Workout Templates{" "}
                          {filterWorkoutTemplates.size > 0 &&
                            `(${filterWorkoutTemplates.size})`}
                        </h3>
                        <div className="flex justify-between items-center pl-[3px]">
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
                        onPress={() => resetFilter(userSettings)}
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
                      ? handleSaveButton
                      : () => setModalPage("base")
                  }
                  isDisabled={isFilterButtonDisabled}
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
