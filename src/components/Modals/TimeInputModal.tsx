import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  TimeInput,
  DatePicker,
} from "@nextui-org/react";
import {
  CalendarDate,
  Time,
  parseDate,
  parseTime,
} from "@internationalized/date";
import { useState, useEffect } from "react";
import {
  ConvertDateStringToTimeString,
  ConvertDateToYmdString,
  ValidateISODateString,
} from "../../helpers";
import { I18nProvider } from "@react-aria/i18n";

type TimeInputModalProps = {
  timeInputModal: ReturnType<typeof useDisclosure>;
  header: string;
  clockStyle: string;
  locale: string;
  value: string | null;
  saveButtonAction: (newTime: Time) => void;
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
    if (newTime === undefined || newTime === null) return;

    saveButtonAction(newTime);
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
                  <span className="w-[5rem] text-lg text-stone-400">
                    Current
                  </span>
                  <TimeInput
                    aria-label="Current Time Read-Only TimeInput"
                    size="lg"
                    className={
                      clockStyle === "24h" ? "w-[6.5rem]" : "w-[8.5rem]"
                    }
                    hourCycle={clockStyle === "24h" ? 24 : 12}
                    granularity="second"
                    isDisabled
                    value={currentTime}
                  />
                  <I18nProvider locale={locale}>
                    <DatePicker
                      aria-label="Current Time Read-Only DatePicker"
                      size="lg"
                      className="w-[10rem]"
                      isDisabled
                      value={currentDate}
                    />
                  </I18nProvider>
                </div>
                <div className="flex gap-2.5 items-center justify-center">
                  <span className="w-[5rem] text-lg text-stone-700">New</span>
                  <TimeInput
                    aria-label="New Time TimeInput"
                    size="lg"
                    className={
                      clockStyle === "24h" ? "w-[6.5rem]" : "w-[8.5rem]"
                    }
                    hourCycle={clockStyle === "24h" ? 24 : 12}
                    granularity="second"
                    value={newTime}
                    onChange={setNewTime}
                  />
                  <I18nProvider locale={locale}>
                    <DatePicker
                      aria-label="New Time DatePicker"
                      size="lg"
                      className="w-[10rem]"
                      value={newDate}
                      onChange={setNewDate}
                      
                    />
                  </I18nProvider>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="success" onPress={() => handleSaveButton()}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
