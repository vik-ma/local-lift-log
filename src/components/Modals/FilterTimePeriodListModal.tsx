import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Select,
  SharedSelection,
  SelectItem,
  ScrollShadow,
} from "@nextui-org/react";
import { UseTimePeriodListReturnType } from "../../typings";
import {
  MultipleChoiceCaloricIntakeDropdown,
  FilterMinAndMaxDates,
  FilterMinAndMaxValues,
} from "..";
import { useFilterMinAndMaxValueInputs } from "../../hooks";
import { useMemo } from "react";

type FilterTimePeriodListModalProps = {
  useTimePeriodList: UseTimePeriodListReturnType;
  locale: string;
};

export const FilterTimePeriodListModal = ({
  useTimePeriodList,
  locale,
}: FilterTimePeriodListModalProps) => {
  const { filterTimePeriodListModal, timePeriodListFilters } =
    useTimePeriodList;

  const {
    filterMinStartDate,
    setFilterMinStartDate,
    filterMaxStartDate,
    setFilterMaxStartDate,
    filterMinEndDate,
    setFilterMinEndDate,
    filterMaxEndDate,
    setFilterMaxEndDate,
    handleFilterSaveButton,
    setFilterMinDuration,
    setFilterMaxDuration,
    isMaxDateBeforeMinDateStart,
    isMaxDateBeforeMinDateEnd,
    filterCaloricIntakeTypes,
    setFilterCaloricIntakeTypes,
    filterHasInjury,
    setFilterHasInjury,
    filterStatus,
    setFilterStatus,
  } = timePeriodListFilters;

  const filterMinAndMaxValueInputs = useFilterMinAndMaxValueInputs(
    1,
    undefined,
    true
  );

  const isFilterButtonDisabled = useMemo(() => {
    if (
      filterMinAndMaxValueInputs.isMinInputInvalid ||
      filterMinAndMaxValueInputs.isMaxInputInvalid ||
      isMaxDateBeforeMinDateStart ||
      isMaxDateBeforeMinDateEnd ||
      filterMinAndMaxValueInputs.isMaxValueBelowMinValue
    )
      return true;

    return false;
  }, [
    filterMinAndMaxValueInputs.isMinInputInvalid,
    filterMinAndMaxValueInputs.isMaxInputInvalid,
    isMaxDateBeforeMinDateStart,
    isMaxDateBeforeMinDateEnd,
    filterMinAndMaxValueInputs.isMaxValueBelowMinValue,
  ]);

  return (
    <Modal
      isOpen={filterTimePeriodListModal.isOpen}
      onOpenChange={filterTimePeriodListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Time Periods</ModalHeader>
            <ModalBody>
              <ScrollShadow className="h-[400px]">
                <div className="flex flex-col gap-2 w-[24rem]">
                  <FilterMinAndMaxDates
                    filterMinDate={filterMinStartDate}
                    setFilterMinDate={setFilterMinStartDate}
                    filterMaxDate={filterMaxStartDate}
                    setFilterMaxDate={setFilterMaxStartDate}
                    locale={locale}
                    isMaxDateBeforeMinDate={isMaxDateBeforeMinDateStart}
                    customLabel="Start Date"
                    isSmallLabel
                  />
                  <FilterMinAndMaxDates
                    filterMinDate={filterMinEndDate}
                    setFilterMinDate={setFilterMinEndDate}
                    filterMaxDate={filterMaxEndDate}
                    setFilterMaxDate={setFilterMaxEndDate}
                    locale={locale}
                    isMaxDateBeforeMinDate={isMaxDateBeforeMinDateEnd}
                    customLabel="End Date"
                    isSmallLabel
                  />
                  <FilterMinAndMaxValues
                    setFilterMinValue={setFilterMinDuration}
                    setFilterMaxValue={setFilterMaxDuration}
                    label="Duration (Days)"
                    useFilterMinAndMaxValueInputs={filterMinAndMaxValueInputs}
                    isSmall
                  />
                  <div className="flex flex-col gap-0.5 py-0.5">
                    <h3 className="font-semibold text-base px-0.5">
                      Caloric Intake Types
                    </h3>
                    <MultipleChoiceCaloricIntakeDropdown
                      values={filterCaloricIntakeTypes}
                      setValues={setFilterCaloricIntakeTypes}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 pt-2.5">
                    <h3 className="font-semibold text-base px-0.5">Injury</h3>
                    <div className="relative w-full">
                      <Select
                        selectionMode="multiple"
                        label="Injury"
                        variant="faded"
                        size="sm"
                        radius="md"
                        selectedKeys={filterHasInjury}
                        onSelectionChange={
                          setFilterHasInjury as React.Dispatch<
                            React.SetStateAction<SharedSelection>
                          >
                        }
                        disableAnimation
                      >
                        <SelectItem key="Has Injury">Has Injury</SelectItem>
                        <SelectItem key="No Injury">No Injury</SelectItem>
                      </Select>
                      {filterHasInjury.size > 0 && (
                        <Button
                          aria-label="Reset Injury Filter"
                          className="absolute right-0 -top-[2rem] h-7"
                          size="sm"
                          variant="flat"
                          onPress={() => setFilterHasInjury(new Set())}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 pt-3">
                    <h3 className="font-semibold text-base px-0.5">Status</h3>
                    <div className="relative w-full">
                      <Select
                        selectionMode="multiple"
                        label="Status"
                        variant="faded"
                        size="sm"
                        radius="md"
                        selectedKeys={filterStatus}
                        onSelectionChange={
                          setFilterStatus as React.Dispatch<
                            React.SetStateAction<SharedSelection>
                          >
                        }
                        disableAnimation
                      >
                        <SelectItem key="Ongoing">Ongoing</SelectItem>
                        <SelectItem key="Finished">Finished</SelectItem>
                      </Select>
                      {filterStatus.size > 0 && (
                        <Button
                          aria-label="Reset Status Filter"
                          className="absolute right-0 -top-[2rem] h-7"
                          size="sm"
                          variant="flat"
                          onPress={() => setFilterStatus(new Set())}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={() =>
                  handleFilterSaveButton(locale, filterTimePeriodListModal)
                }
                isDisabled={isFilterButtonDisabled}
              >
                Filter
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
