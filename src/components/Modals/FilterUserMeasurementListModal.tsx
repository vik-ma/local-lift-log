import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import {
  UseDisclosureReturnType,
  UseListFiltersReturnType,
} from "../../typings";
import { FilterDateRangeAndWeekdays } from "..";

type FilterUserMeasurementListModalProps = {
  filterUserMeasurementListModal: UseDisclosureReturnType;
  useListFilters: UseListFiltersReturnType;
  locale: string;
  buttonAction: (locale: string, activeModal: UseDisclosureReturnType) => void;
};

export const FilterUserMeasurementListModal = ({
  filterUserMeasurementListModal,
  useListFilters,
  locale,
  buttonAction,
}: FilterUserMeasurementListModalProps) => {
  const {
    filterDateRange,
    setFilterDateRange,
    filterWeekdays,
    setFilterWeekdays,
    weekdayMap,
    showResetFilterButton,
    resetFilter,
  } = useListFilters;

  return (
    <Modal
      isOpen={filterUserMeasurementListModal.isOpen}
      onOpenChange={filterUserMeasurementListModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter User Weights</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <FilterDateRangeAndWeekdays
                  filterDateRange={filterDateRange}
                  setFilterDateRange={setFilterDateRange}
                  filterWeekdays={filterWeekdays}
                  setFilterWeekdays={setFilterWeekdays}
                  weekdayMap={weekdayMap}
                  locale={locale}
                  dateRangeLabel="User Measurement Dates"
                />
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {showResetFilterButton && (
                  <Button variant="flat" onPress={resetFilter}>
                    Reset
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
                    buttonAction(locale, filterUserMeasurementListModal)
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
