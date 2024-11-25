import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import {
  Measurement,
  UseDisclosureReturnType,
  UseListFiltersReturnType,
  UseMeasurementListReturnType,
} from "../../typings";
import { FilterDateRangeAndWeekdays, MeasurementModalList } from "..";
import { useMemo, useState } from "react";

type FilterUserMeasurementListModalProps = {
  filterUserMeasurementListModal: UseDisclosureReturnType;
  useListFilters: UseListFiltersReturnType;
  locale: string;
  useMeasurementList: UseMeasurementListReturnType;
};

type ModalPage = "base" | "measurement-list";

export const FilterUserMeasurementListModal = ({
  filterUserMeasurementListModal,
  useListFilters,
  locale,
  useMeasurementList,
}: FilterUserMeasurementListModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const {
    filterDateRange,
    setFilterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
    filterMeasurements,
    setFilterMeasurements,
  } = useListFilters;

  const { measurementMap } = useMeasurementList;

  const filterMeasurementsString = useMemo(() => {
    if (filterMeasurements.size === 0) return "No Measurements Selected";

    const measurementNames: string[] = [];

    for (const measurementId of filterMeasurements) {
      if (measurementMap.has(measurementId.toString())) {
        const measurement = measurementMap.get(measurementId.toString());
        measurementNames.push(measurement!.name);
      }
    }

    return measurementNames.join(", ");
  }, [filterMeasurements, measurementMap]);

  const showClearAllButton = useMemo(() => {
    if (modalPage === "measurement-list" && filterMeasurements.size > 0) {
      return true;
    }

    return false;
  }, [modalPage, filterMeasurements]);

  const handleMeasurementClick = (measurement: Measurement) => {
    const updatedMeasurementSet = new Set(filterMeasurements);

    if (updatedMeasurementSet.has(measurement.id)) {
      updatedMeasurementSet.delete(measurement.id);
    } else {
      updatedMeasurementSet.add(measurement.id);
    }

    setFilterMeasurements(updatedMeasurementSet);
  };

  return (
    <Modal
      isOpen={filterUserMeasurementListModal.isOpen}
      onOpenChange={filterUserMeasurementListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {modalPage === "measurement-list"
                ? "Select Measurements To Filter"
                : "Filter User Weights"}
            </ModalHeader>
            <ModalBody>
              {modalPage === "measurement-list" ? (
                <MeasurementModalList
                  useMeasurementList={useMeasurementList}
                  handleMeasurementClick={handleMeasurementClick}
                  filterMeasurements={filterMeasurements}
                />
              ) : (
                <ScrollShadow className="h-[400px]">
                  <div className="flex flex-col gap-3">
                    <FilterDateRangeAndWeekdays
                      filterDateRange={filterDateRange}
                      setFilterDateRange={setFilterDateRange}
                      filterWeekdays={filterWeekdays}
                      setFilterWeekdays={setFilterWeekdays}
                      weekdayMap={weekdayMap}
                      locale={locale}
                      dateRangeLabel="User Measurement Dates"
                    />
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg px-0.5">
                        Measurements{" "}
                        {filterMeasurements.size > 0 &&
                          `(${filterMeasurements.size})`}
                      </h3>
                      <div className="flex justify-between items-center px-0.5">
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
                  onPress={() =>
                    handleFilterSaveButton(
                      locale,
                      filterUserMeasurementListModal
                    )
                  }
                >
                  Done
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
