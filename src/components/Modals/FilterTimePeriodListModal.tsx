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
} from "@heroui/react";
import {
  TimePeriodFilterValues,
  UseFilterMinAndMaxValueInputsProps,
  UseTimePeriodListReturnType,
} from "../../typings";
import {
  MultipleChoiceDietPhaseDropdown,
  FilterMinAndMaxDates,
  FilterMinAndMaxValues,
} from "..";
import { useEffect, useMemo, useState } from "react";
import { useFilterDateRange, useFilterMinAndMaxValueInputs } from "../../hooks";
import {
  ConvertInputStringToNumberOrNull,
  ConvertNumberToInputString,
} from "../../helpers";
import { MODAL_BODY_HEIGHT } from "../../constants";

type FilterTimePeriodListModalProps = {
  useTimePeriodList: UseTimePeriodListReturnType;
  locale: string;
};

export const FilterTimePeriodListModal = ({
  useTimePeriodList,
  locale,
}: FilterTimePeriodListModalProps) => {
  const [filterHasInjury, setFilterHasInjury] = useState<Set<string>>(
    new Set()
  );
  const [filterDietPhaseTypes, setFilterDietPhaseTypes] = useState<Set<string>>(
    new Set()
  );
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set());

  const { filterTimePeriodListModal, timePeriodListFilters } =
    useTimePeriodList;

  const filterStartDateRange = useFilterDateRange();
  const filterEndDateRange = useFilterDateRange();

  const filterMinAndMaxValueInputsProps: UseFilterMinAndMaxValueInputsProps = {
    minValue: 1,
    maxValue: undefined,
    isIntegerOnly: true,
  };

  const filterMinAndMaxValueInputsDuration = useFilterMinAndMaxValueInputs(
    filterMinAndMaxValueInputsProps
  );

  const {
    filterMap,
    resetFilter,
    handleFilterSaveButton,
    timePeriodFilterValues,
  } = timePeriodListFilters;

  const isFilterButtonDisabled = useMemo(() => {
    if (filterStartDateRange.isMaxDateBeforeMinDate) return true;
    if (filterEndDateRange.isMaxDateBeforeMinDate) return true;
    if (filterMinAndMaxValueInputsDuration.isFilterInvalid) return true;

    return false;
  }, [
    filterStartDateRange.isMaxDateBeforeMinDate,
    filterEndDateRange.isMaxDateBeforeMinDate,
    filterMinAndMaxValueInputsDuration.isFilterInvalid,
  ]);

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (!filterStartDateRange.areDateFiltersEmpty) return true;
    if (!filterEndDateRange.areDateFiltersEmpty) return true;
    if (!filterMinAndMaxValueInputsDuration.areInputsEmpty) return true;
    if (filterDietPhaseTypes.size > 0) return true;
    if (filterHasInjury.size > 0) return true;
    if (filterStatus.size > 0) return true;

    return false;
  }, [
    filterMap,
    filterStartDateRange.areDateFiltersEmpty,
    filterEndDateRange.areDateFiltersEmpty,
    filterMinAndMaxValueInputsDuration.areInputsEmpty,
    filterDietPhaseTypes,
    filterHasInjury,
    filterStatus,
  ]);

  const handleSaveButton = () => {
    if (isFilterButtonDisabled) return;

    const filterValues: TimePeriodFilterValues = {
      filterMinStartDate: filterStartDateRange.filterMinDate,
      filterMaxStartDate: filterStartDateRange.filterMaxDate,
      filterMinEndDate: filterEndDateRange.filterMinDate,
      filterMaxEndDate: filterEndDateRange.filterMaxDate,
      filterMinDuration: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsDuration.minInput
      ),
      filterMaxDuration: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsDuration.maxInput
      ),
      filterDietPhaseTypes: filterDietPhaseTypes,
      filterHasInjury: filterHasInjury,
      filterStatus: filterStatus,
    };

    handleFilterSaveButton(locale, filterValues, filterTimePeriodListModal);
  };

  useEffect(() => {
    filterStartDateRange.setFilterMinDate(
      timePeriodFilterValues.filterMinStartDate
    );
    filterStartDateRange.setFilterMaxDate(
      timePeriodFilterValues.filterMaxStartDate
    );

    filterEndDateRange.setFilterMinDate(
      timePeriodFilterValues.filterMinEndDate
    );
    filterEndDateRange.setFilterMaxDate(
      timePeriodFilterValues.filterMaxEndDate
    );

    filterMinAndMaxValueInputsDuration.setMinInput(
      ConvertNumberToInputString(timePeriodFilterValues.filterMinDuration)
    );
    filterMinAndMaxValueInputsDuration.setMaxInput(
      ConvertNumberToInputString(timePeriodFilterValues.filterMaxDuration)
    );

    setFilterHasInjury(timePeriodFilterValues.filterHasInjury);
    setFilterDietPhaseTypes(timePeriodFilterValues.filterDietPhaseTypes);
    setFilterStatus(timePeriodFilterValues.filterStatus);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriodFilterValues]);

  return (
    <Modal
      isOpen={filterTimePeriodListModal.isOpen}
      onOpenChange={filterTimePeriodListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Time Periods</ModalHeader>
            <ModalBody className="py-0">
              <ScrollShadow className={`${MODAL_BODY_HEIGHT}`}>
                <div className="flex flex-col w-[24rem]">
                  <div className="flex flex-col gap-2 pt-2">
                    <FilterMinAndMaxDates
                      useFilterDateRange={filterStartDateRange}
                      locale={locale}
                      customLabel="Start Date"
                      isSmallLabel
                    />
                    <FilterMinAndMaxDates
                      useFilterDateRange={filterEndDateRange}
                      locale={locale}
                      customLabel="End Date"
                      isSmallLabel
                    />
                  </div>
                  <div className="flex flex-col gap-px">
                    <h3 className="text-lg font-semibold px-0.5">Duration</h3>
                    <FilterMinAndMaxValues
                      label="Days"
                      useFilterMinAndMaxValueInputs={
                        filterMinAndMaxValueInputsDuration
                      }
                      isSmall
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-0.5">
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-semibold text-lg px-0.5">
                        Diet Phase Types
                      </h3>
                      <MultipleChoiceDietPhaseDropdown
                        values={filterDietPhaseTypes}
                        setValues={setFilterDietPhaseTypes}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-semibold text-lg px-0.5">Injury</h3>
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
                    <div className="flex flex-col gap-0.5">
                      <h3 className="font-semibold text-lg px-0.5">Status</h3>
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
                          <SelectItem key="Ended">Ended</SelectItem>
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
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                {showResetFilterButton && (
                  <Button variant="flat" onPress={resetFilter}>
                    Reset All Filters
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={handleSaveButton}
                  isDisabled={isFilterButtonDisabled}
                >
                  Filter
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
