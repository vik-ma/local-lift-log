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

type FilterMinAndMaxDatesModalProps = {
  filterMinAndMaxDatesModal: UseDisclosureReturnType;
  filterMinDate: CalendarDate | null;
  setFilterMinDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  filterMaxDate: CalendarDate | null;
  setFilterMaxDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  locale: string;
};

export const FilterMinAndMaxDatesModal = ({
  filterMinAndMaxDatesModal,
  filterMinDate,
  setFilterMinDate,
  filterMaxDate,
  setFilterMaxDate,
  locale,
}: FilterMinAndMaxDatesModalProps) => {
  const isMaxDateBeforeMinDate = useIsEndDateBeforeStartDate(
    filterMinDate,
    filterMaxDate
  );

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
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
