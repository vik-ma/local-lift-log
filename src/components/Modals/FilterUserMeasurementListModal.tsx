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
    showResetFilterButton,
    resetFilter,
    handleFilterSaveButton,
    filterMeasurements,
    setFilterMeasurements,
    filterMeasurementsString,
    handleClickMeasurement,
    isMaxDateBeforeMinDate,
  } = useListFilters;

  const showClearAllButton = useMemo(() => {
    if (modalPage === "measurement-list" && filterMeasurements.size > 0) {
      return true;
    }

    return false;
  }, [modalPage, filterMeasurements]);

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
                  handleMeasurementClick={handleClickMeasurement}
                  highlightedMeasurements={filterMeasurements}
                />
              ) : (
                <ScrollShadow className="h-[400px]">
                  <div className="flex flex-col gap-3">
                    <FilterDateRangeAndWeekdays
                      useListFilters={useListFilters}
                      locale={locale}
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
                  onPress={
                    modalPage === "base"
                      ? () =>
                          handleFilterSaveButton(
                            locale,
                            filterUserMeasurementListModal
                          )
                      : () => setModalPage("base")
                  }
                  isDisabled={modalPage === "base" && isMaxDateBeforeMinDate}
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
