import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  CalendarDate,
} from "@heroui/react";
import { UseDisclosureReturnType } from "../../typings";
import { useIsEndDateBeforeStartDate } from "../../hooks";
import { FilterMinAndMaxDates } from "..";
import { useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";

type FilterMinAndMaxDatesModalProps = {
  filterMinAndMaxDatesModal: UseDisclosureReturnType;
  locale: string;
  doneButtonAction: (minDate: Date | null, maxDate: Date | null) => void;
};

export const FilterMinAndMaxDatesModal = ({
  filterMinAndMaxDatesModal,
  locale,
  doneButtonAction,
}: FilterMinAndMaxDatesModalProps) => {
  const [filterMinDate, setFilterMinDate] = useState<CalendarDate | null>(null);
  const [filterMaxDate, setFilterMaxDate] = useState<CalendarDate | null>(null);

  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate(
    filterMinDate,
    filterMaxDate
  );

  const handleFilterButton = () => {
    if (isMaxDateBeforeMinDate) return;

    const minDate =
      filterMinDate === null ? null : filterMinDate.toDate(getLocalTimeZone());
    const maxDate =
      filterMaxDate === null ? null : filterMaxDate.toDate(getLocalTimeZone());

    doneButtonAction(minDate, maxDate);
  };

  return (
    <Modal
      isOpen={filterMinAndMaxDatesModal.isOpen}
      onOpenChange={filterMinAndMaxDatesModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Filter Dates</ModalHeader>
            <ModalBody>
              <FilterMinAndMaxDates
                filterMinDate={filterMinDate}
                setFilterMinDate={setFilterMinDate}
                filterMaxDate={filterMaxDate}
                setFilterMaxDate={setFilterMaxDate}
                locale={locale}
                isMaxDateBeforeMinDate={isMaxDateBeforeMinDate}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleFilterButton}
                isDisabled={isMaxDateBeforeMinDate}
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
