import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  DateRangePicker,
  RangeValue,
  CalendarDate,
} from "@nextui-org/react";
import { UseDisclosureReturnType } from "../../typings";
import { I18nProvider } from "@react-aria/i18n";
import { useState } from "react";

type DateRangeModalProps = {
  dateRangeModal: UseDisclosureReturnType;
  header: string;
  locale: string;
  buttonAction: () => void;
};

export const DateRangeModal = ({
  dateRangeModal,
  header,
  locale,
  buttonAction,
}: DateRangeModalProps) => {
  const [dateRange, setDateRange] = useState<RangeValue<CalendarDate> | null>(
    null
  );

  return (
    <Modal
      isOpen={dateRangeModal.isOpen}
      onOpenChange={dateRangeModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div className="h-16">
                <I18nProvider locale={locale}>
                  <DateRangePicker
                    label="Stay duration"
                    variant="faded"
                    value={dateRange}
                    onChange={setDateRange}
                    visibleMonths={2}
                  />
                </I18nProvider>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={() => buttonAction()}>
                Done
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
