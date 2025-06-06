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
  UseDisclosureReturnType,
  UseFilterMinAndMaxValueInputsReturnType,
  UseListFiltersReturnType,
  UseMeasurementListReturnType,
} from "../../typings";
import {
  FilterDateRangeAndWeekdays,
  FilterMinAndMaxValues,
  MeasurementModalList,
  WeightUnitDropdown,
} from "..";
import { useMemo, useState } from "react";

type FilterBodyMeasurementsListModalProps = {
  filterBodyMeasurementsListModal: UseDisclosureReturnType;
  useListFilters: UseListFiltersReturnType;
  locale: string;
  useMeasurementList: UseMeasurementListReturnType;
  include0InMaxValuesWeight: boolean;
  setInclude0InMaxValuesWeight: React.Dispatch<React.SetStateAction<boolean>>;
  filterMinAndMaxValueInputsBodyFat: UseFilterMinAndMaxValueInputsReturnType;
  includeNullInMaxValuesBodyFat: boolean;
  setIncludeNullInMaxValuesBodyFat: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

type ModalPage = "base" | "measurement-list";

export const FilterBodyMeasurementsListModal = ({
  filterBodyMeasurementsListModal,
  useListFilters,
  locale,
  useMeasurementList,
  include0InMaxValuesWeight,
  setInclude0InMaxValuesWeight,
  filterMinAndMaxValueInputsBodyFat,
  includeNullInMaxValuesBodyFat,
  setIncludeNullInMaxValuesBodyFat,
}: FilterBodyMeasurementsListModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const {
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
    filterMeasurements,
    setFilterMeasurements,
    filterMeasurementsString,
    handleClickMeasurement,
    isMaxDateBeforeMinDate,
    filterMinAndMaxValueInputs,
    setFilterMinWeight,
    setFilterMaxWeight,
    filterWeightRangeUnit,
    setFilterWeightRangeUnit,
    setFilterMinBodyFatPercentage,
    setFilterMaxBodyFatPercentage,
  } = useListFilters;

  const showClearAllButton = useMemo(() => {
    if (modalPage === "measurement-list" && filterMeasurements.size > 0) {
      return true;
    }

    return false;
  }, [modalPage, filterMeasurements]);

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
                      useListFilters={useListFilters}
                      locale={locale}
                    />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex flex-col gap-px">
                        <h3 className="text-lg font-semibold px-0.5">Weight</h3>
                        <div className="flex gap-5 items-end">
                          <FilterMinAndMaxValues
                            setFilterMinValue={setFilterMinWeight}
                            setFilterMaxValue={setFilterMaxWeight}
                            label="Weight"
                            useFilterMinAndMaxValueInputs={
                              filterMinAndMaxValueInputs
                            }
                            includeNullInMaxValues={include0InMaxValuesWeight}
                            setIncludeNullInMaxValues={
                              setInclude0InMaxValuesWeight
                            }
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
                            setFilterMinValue={setFilterMinBodyFatPercentage}
                            setFilterMaxValue={setFilterMaxBodyFatPercentage}
                            label="%"
                            useFilterMinAndMaxValueInputs={
                              filterMinAndMaxValueInputsBodyFat
                            }
                            includeNullInMaxValues={
                              includeNullInMaxValuesBodyFat
                            }
                            setIncludeNullInMaxValues={
                              setIncludeNullInMaxValuesBodyFat
                            }
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
                      ? () =>
                          handleFilterSaveButton(
                            locale,
                            filterBodyMeasurementsListModal
                          )
                      : () => setModalPage("base")
                  }
                  isDisabled={
                    modalPage === "base" &&
                    (isMaxDateBeforeMinDate ||
                      filterMinAndMaxValueInputs.isFilterInvalid ||
                      filterMinAndMaxValueInputsBodyFat.isFilterInvalid)
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
