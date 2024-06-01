import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  TimeInput,
} from "@nextui-org/react";
import { Time, parseTime } from "@internationalized/date";
import { useState } from "react";
import { ConvertDateStringToTimeString } from "../../helpers";

type TimeInputModalProps = {
  timeInputModal: ReturnType<typeof useDisclosure>;
  header: string;
  clockStyle: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  saveButtonAction: () => void;
};

export const TimeInputModal = ({
  timeInputModal,
  header,
  clockStyle,
  value,
  setValue,
  saveButtonAction,
}: TimeInputModalProps) => {
  const currentDateString = ConvertDateStringToTimeString(value, true);
  const parsedCurrentTime = parseTime(currentDateString);
  const [newTime, setNewTime] = useState<Time>(parsedCurrentTime);

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
                <div className="flex gap-3 items-center justify-center">
                  <span className="w-32 text-lg text-stone-400">
                    Current Time
                  </span>
                  <TimeInput
                    aria-label="Current Time Read-Only TimeInput"
                    size="lg"
                    isDisabled
                    className={
                      clockStyle === "24h" ? "w-[6.5rem]" : "w-[8.5rem]"
                    }
                    hourCycle={clockStyle === "24h" ? 24 : 12}
                    granularity="second"
                    value={parsedCurrentTime}
                  />
                </div>
                <div className="flex gap-3 items-center justify-center">
                  <span className="w-32 text-lg text-stone-700">New Time</span>
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
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="success" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="success" onPress={saveButtonAction}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
