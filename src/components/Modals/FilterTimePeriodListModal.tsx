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
import { UseTimePeriodListReturnType } from "../../typings";
import {
  MultipleChoiceDietPhaseDropdown,
  FilterMinAndMaxDates,
  FilterMinAndMaxValues,
} from "..";
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
    filterDietPhaseTypes,
    setFilterDietPhaseTypes,
    filterHasInjury,
    setFilterHasInjury,
    filterStatus,
    setFilterStatus,
    resetFilter,
    showResetFilterButton,
    filterMinAndMaxValueInputs,
  } = timePeriodListFilters;

  const isFilterButtonDisabled = useMemo(() => {
    if (
      filterMinAndMaxValueInputs.isFilterInvalid ||
      isMaxDateBeforeMinDateStart ||
      isMaxDateBeforeMinDateEnd
    )
      return true;

    return false;
  }, [
    filterMinAndMaxValueInputs.isFilterInvalid,
    isMaxDateBeforeMinDateStart,
    isMaxDateBeforeMinDateEnd,
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
            <ModalBody className="pt-0">
              <ScrollShadow className="h-[400px]">
                <div className="flex flex-col w-[24rem]">
                  <div className="flex flex-col gap-2 pt-2">
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
                  </div>
                  <div className="flex flex-col gap-px">
                    <h3 className="text-lg font-semibold px-0.5">Duration</h3>
                    <FilterMinAndMaxValues
                      setFilterMinValue={setFilterMinDuration}
                      setFilterMaxValue={setFilterMaxDuration}
                      label="Days"
                      useFilterMinAndMaxValueInputs={filterMinAndMaxValueInputs}
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
                  onPress={() =>
                    handleFilterSaveButton(locale, filterTimePeriodListModal)
                  }
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
