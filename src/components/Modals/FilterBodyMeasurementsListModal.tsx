import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@heroui/react";
import {
  ListFilterValues,
  Measurement,
  UseDisclosureReturnType,
  UseListFiltersReturnType,
  UseMeasurementListReturnType,
  UserSettings,
} from "../../typings";
import {
  FilterDateRangeAndWeekdays,
  FilterMinAndMaxValues,
  MeasurementModalList,
  WeightUnitDropdown,
} from "..";
import { useEffect, useMemo, useState } from "react";
import {
  useFilterDateRangeAndWeekdays,
  useFilterMinAndMaxValueInputs,
} from "../../hooks";
import {
  ConvertInputStringToNumberOrNull,
  ConvertNumberToInputString,
} from "../../helpers";

type FilterBodyMeasurementsListModalProps = {
  filterBodyMeasurementsListModal: UseDisclosureReturnType;
  useListFilters: UseListFiltersReturnType;
  userSettings: UserSettings;
  useMeasurementList: UseMeasurementListReturnType;
};

type ModalPage = "base" | "measurement-list";

export const FilterBodyMeasurementsListModal = ({
  filterBodyMeasurementsListModal,
  useListFilters,
  userSettings,
  useMeasurementList,
}: FilterBodyMeasurementsListModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");
  const [filterMeasurements, setFilterMeasurements] = useState<Set<string>>(
    new Set()
  );
  const [filterWeightRangeUnit, setFilterWeightRangeUnit] =
    useState<string>("kg");

  const filterMinAndMaxValueInputsWeight = useFilterMinAndMaxValueInputs();
  const filterMinAndMaxValueInputsBodyFatPercentage =
    useFilterMinAndMaxValueInputs({
      maxValue: 100,
    });

  const filterDateRangeAndWeekdays = useFilterDateRangeAndWeekdays();

  const {
    filterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    areDateRangeAndWeekdaysFiltersEmpty,
  } = filterDateRangeAndWeekdays;

  const {
    filterMinDate,
    setFilterMinDate,
    filterMaxDate,
    setFilterMaxDate,
    isMaxDateBeforeMinDate,
  } = filterDateRange;

  const {
    filterMap,
    resetFilter,
    handleFilterSaveButton,
    getFilterMeasurementsString,
    weekdayMap,
    listFilterValues,
  } = useListFilters;

  const showClearAllButton = useMemo(() => {
    if (modalPage === "measurement-list" && filterMeasurements.size > 0) {
      return true;
    }

    return false;
  }, [modalPage, filterMeasurements]);

  const isFilterButtonDisabled = useMemo(() => {
    if (modalPage !== "base") return false;
    if (isMaxDateBeforeMinDate) return true;
    if (filterMinAndMaxValueInputsWeight.isFilterInvalid) return true;
    if (filterMinAndMaxValueInputsBodyFatPercentage.isFilterInvalid)
      return true;

    return false;
  }, [
    modalPage,
    isMaxDateBeforeMinDate,
    filterMinAndMaxValueInputsWeight.isFilterInvalid,
    filterMinAndMaxValueInputsBodyFatPercentage.isFilterInvalid,
  ]);

  const showResetFilterButton = useMemo(() => {
    if (filterMap.size > 0) return true;
    if (!areDateRangeAndWeekdaysFiltersEmpty) return true;
    if (filterMeasurements.size > 0) return true;
    if (!filterMinAndMaxValueInputsWeight.areInputsEmpty) return true;
    if (!filterMinAndMaxValueInputsBodyFatPercentage.areInputsEmpty)
      return true;

    return false;
  }, [
    filterMap,
    areDateRangeAndWeekdaysFiltersEmpty,
    filterMeasurements,
    filterMinAndMaxValueInputsWeight.areInputsEmpty,
    filterMinAndMaxValueInputsBodyFatPercentage.areInputsEmpty,
  ]);

  const filterMeasurementsString = useMemo(() => {
    return getFilterMeasurementsString(filterMeasurements);
  }, [getFilterMeasurementsString, filterMeasurements]);

  const handleClickMeasurement = (measurement: Measurement) => {
    const updatedMeasurementSet = new Set(filterMeasurements);

    if (updatedMeasurementSet.has(measurement.id.toString())) {
      updatedMeasurementSet.delete(measurement.id.toString());
    } else {
      updatedMeasurementSet.add(measurement.id.toString());
    }

    setFilterMeasurements(updatedMeasurementSet);
  };

  const handleSaveButton = () => {
    if (isFilterButtonDisabled) return;

    const filterValues: ListFilterValues = {
      ...listFilterValues,
      filterMinDate: filterMinDate,
      filterMaxDate: filterMaxDate,
      filterWeekdays: filterWeekdays,
      filterMeasurements: filterMeasurements,
      filterMinWeight: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsWeight.minInput
      ),
      filterMaxWeight: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsWeight.maxInput
      ),
      filterWeightRangeUnit: filterWeightRangeUnit,
      filterMinBodyFatPercentage: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsBodyFatPercentage.minInput
      ),
      filterMaxBodyFatPercentage: ConvertInputStringToNumberOrNull(
        filterMinAndMaxValueInputsBodyFatPercentage.maxInput
      ),
      includeNullInMaxValues:
        filterMinAndMaxValueInputsWeight.includeNullInMaxValues,
      includeNullInMaxValuesSecondary:
        filterMinAndMaxValueInputsBodyFatPercentage.includeNullInMaxValues,
    };

    handleFilterSaveButton(
      userSettings.locale,
      filterValues,
      filterBodyMeasurementsListModal
    );
  };

  useEffect(() => {
    setFilterMinDate(listFilterValues.filterMinDate);
    setFilterMaxDate(listFilterValues.filterMaxDate);
    setFilterWeekdays(listFilterValues.filterWeekdays);
    setFilterMeasurements(listFilterValues.filterMeasurements);

    filterMinAndMaxValueInputsWeight.setMinInput(
      ConvertNumberToInputString(listFilterValues.filterMinWeight)
    );
    filterMinAndMaxValueInputsWeight.setMaxInput(
      ConvertNumberToInputString(listFilterValues.filterMaxWeight)
    );
    filterMinAndMaxValueInputsWeight.setIncludeNullInMaxValues(
      listFilterValues.includeNullInMaxValues
    );

    setFilterWeightRangeUnit(listFilterValues.filterWeightRangeUnit);

    filterMinAndMaxValueInputsBodyFatPercentage.setMinInput(
      ConvertNumberToInputString(listFilterValues.filterMinBodyFatPercentage)
    );
    filterMinAndMaxValueInputsBodyFatPercentage.setMaxInput(
      ConvertNumberToInputString(listFilterValues.filterMaxBodyFatPercentage)
    );
    filterMinAndMaxValueInputsBodyFatPercentage.setIncludeNullInMaxValues(
      listFilterValues.includeNullInMaxValuesSecondary
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFilterValues]);

  return (
    <Modal
      isOpen={filterBodyMeasurementsListModal.isOpen}
      onOpenChange={filterBodyMeasurementsListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "measurement-list"
                ? "Select Measurements To Filter"
                : "Filter Body Measurements"}
            </ModalHeader>
            <ModalBody>
              {modalPage === "measurement-list" ? (
                <MeasurementModalList
                  useMeasurementList={useMeasurementList}
                  handleMeasurementClick={handleClickMeasurement}
                  highlightedMeasurements={filterMeasurements}
                />
              ) : (
                <ScrollShadow className="h-[400px]">
                  <div className="flex flex-col gap-4 w-[24rem]">
                    <FilterDateRangeAndWeekdays
                      useFilterDateRangeAndWeekdays={filterDateRangeAndWeekdays}
                      locale={userSettings.locale}
                      weekdayMap={weekdayMap}
                    />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-col gap-px">
                        <h3 className="text-lg font-semibold px-0.5">Weight</h3>
                        <div className="flex gap-5 items-end">
                          <FilterMinAndMaxValues
                            label="Weight"
                            useFilterMinAndMaxValueInputs={
                              filterMinAndMaxValueInputsWeight
                            }
                            showIncludeNullInMaxValuesCheckbox
                          />
                          <div className="pb-4">
                            <WeightUnitDropdown
                              value={filterWeightRangeUnit}
                              setState={setFilterWeightRangeUnit}
                              targetType="state"
                              showBigLabel
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold px-0.5">
                            Body Fat Percentage
                          </h3>
                          <FilterMinAndMaxValues
                            label="%"
                            useFilterMinAndMaxValueInputs={
                              filterMinAndMaxValueInputsBodyFatPercentage
                            }
                            showIncludeNullInMaxValuesCheckbox
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg px-0.5">
                          Measurements{" "}
                          {filterMeasurements.size > 0 &&
                            `(${filterMeasurements.size})`}
                        </h3>
                        <div className="flex justify-between items-center pl-[3px]">
                          <div
                            className={
                              filterMeasurements.size === 0
                                ? "w-[15rem] text-sm break-words text-stone-400"
                                : "w-[15rem] text-sm break-words text-secondary"
                            }
                          >
                            {filterMeasurementsString}
                          </div>
                          <Button
                            className="w-[9rem]"
                            variant="flat"
                            size="sm"
                            onPress={() => setModalPage("measurement-list")}
                          >
                            Filter Measurements
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
                        onPress={() => setFilterMeasurements(new Set())}
                      >
                        Clear All
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {showResetFilterButton && (
                      <Button variant="flat" onPress={resetFilter}>
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
