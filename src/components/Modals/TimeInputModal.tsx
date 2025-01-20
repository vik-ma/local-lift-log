import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  TimeInput,
  DatePicker,
} from "@nextui-org/react";
import {
  CalendarDate,
  CalendarDateTime,
  Time,
  parseDate,
  parseTime,
  getLocalTimeZone,
} from "@internationalized/date";
import { useState, useEffect } from "react";
import {
  ConvertDateStringToTimeString,
  ConvertDateToYmdString,
  ValidateISODateString,
} from "../../helpers";
import { I18nProvider } from "@react-aria/i18n";
import { UseDisclosureReturnType } from "../../typings";

type TimeInputModalProps = {
  timeInputModal: UseDisclosureReturnType;
  header: string;
  clockStyle: string;
  locale: string;
  value: string | null;
  saveButtonAction: (updatedDateTimeISOstring: string) => void;
};

export const TimeInputModal = ({
  timeInputModal,
  header,
  clockStyle,
  value,
  locale,
  saveButtonAction,
}: TimeInputModalProps) => {
  const [currentTime, setCurrentTime] = useState<Time | null>(null);
  const [newTime, setNewTime] = useState<Time | null>(null);
  const [currentDate, setCurrentDate] = useState<CalendarDate | null>(null);
  const [newDate, setNewDate] = useState<CalendarDate | null>(null);

  useEffect(() => {
    if (value === null || !ValidateISODateString(value)) return;

    const currentTimeString = ConvertDateStringToTimeString(value, true);
    const parsedCurrentTime = parseTime(currentTimeString);

    const currentDateString = ConvertDateToYmdString(new Date(value));
    const parsedCurrentDate = parseDate(currentDateString);

    setNewTime(parsedCurrentTime);
    setCurrentTime(parsedCurrentTime);
    setNewDate(parsedCurrentDate);
    setCurrentDate(parsedCurrentDate);
  }, [value]);

  const handleSaveButton = () => {
    if (newTime === null || newDate === null) return;

    const date = new CalendarDateTime(
      newDate.year,
      newDate.month,
      newDate.day,
      newTime.hour,
      newTime.minute,
      newTime.second
    );

    const dateString = date.toDate(getLocalTimeZone()).toISOString();

    saveButtonAction(dateString);
  };

  return (
    <Modal
      isOpen={timeInputModal.isOpen}
      onOpenChange={timeInputModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-2.5 font-medium">
                <div className="flex gap-2.5 items-center justify-center">
                  <span className="w-[5rem] text-lg text-default-400">
                    Current
                  </span>
                  <TimeInput
                    aria-label="Current Time Read-Only TimeInput"
                    variant="faded"
                    className={
                      clockStyle === "24h" ? "w-[6.25rem]" : "w-[8rem]"
                    }
                    hourCycle={clockStyle === "24h" ? 24 : 12}
                    granularity="second"
                    isDisabled
                    value={currentTime}
                  />
                  <I18nProvider locale={locale}>
                    <DatePicker
                      aria-label="Current Time Read-Only DatePicker"
                      variant="faded"
                      className="w-[9.5rem]"
                      isDisabled
                      value={currentDate}
                    />
                  </I18nProvider>
                </div>
                <div className="flex gap-2.5 items-center justify-center">
                  <span className="w-[5rem] text-lg text-default-600">New</span>
                  <TimeInput
                    aria-label="New Time TimeInput"
                    variant="faded"
                    className={
                      clockStyle === "24h" ? "w-[6.25rem]" : "w-[8rem]"
                    }
                    hourCycle={clockStyle === "24h" ? 24 : 12}
                    granularity="second"
                    value={newTime}
                    onChange={setNewTime}
                  />
                  <I18nProvider locale={locale}>
                    <DatePicker
                      aria-label="New Time DatePicker"
                      variant="faded"
                      className="w-[9.5rem]"
                      value={newDate}
                      onChange={setNewDate}
                    />
                  </I18nProvider>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={() => handleSaveButton()}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
