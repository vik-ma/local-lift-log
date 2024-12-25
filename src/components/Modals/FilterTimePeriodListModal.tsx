import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
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
              <div className="h-[400px] flex flex-col gap-2">
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
              </div>
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
