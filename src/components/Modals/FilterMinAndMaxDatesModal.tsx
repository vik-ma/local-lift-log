import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  CalendarDate,
  DateValue,
} from "@heroui/react";
import { UseDisclosureReturnType } from "../../typings";
import { useIsEndDateBeforeStartDate } from "../../hooks";
import { FilterMinAndMaxDates } from "..";
import { useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";

type FilterMinAndMaxDatesModalProps = {
  filterMinAndMaxDatesModal: UseDisclosureReturnType;
  locale: string;
  validStartDate: Date | null;
  validEndDate: Date | null;
  doneButtonAction: (minDate: Date | null, maxDate: Date | null) => void;
};

export const FilterMinAndMaxDatesModal = ({
  filterMinAndMaxDatesModal,
  locale,
  validStartDate,
  validEndDate,
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

  const isDateUnavailable = (date: DateValue) => {
    const dateObj = date.toDate(getLocalTimeZone());

    if (validStartDate !== null && dateObj < validStartDate) return true;
    if (validEndDate !== null && dateObj > validEndDate) return true;

    return false;
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
                isDateUnavailable={isDateUnavailable}
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
