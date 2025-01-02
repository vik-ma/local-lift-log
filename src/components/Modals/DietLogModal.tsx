import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { DietLog, UseDisclosureReturnType, UserSettings } from "../../typings";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  dietLog: DietLog;
  setDietLog: React.Dispatch<React.SetStateAction<DietLog>>;
  targetDay: string;
  setTargetDay: React.Dispatch<React.SetStateAction<string>>;
  userSettings: UserSettings;
  buttonAction: () => void;
};

export const DietLogModal = ({
  dietLogModal,
  dietLog,
  setDietLog,
  targetDay,
  setTargetDay,
  userSettings,
  buttonAction,
}: DietLogModalProps) => {
  const handleTargetDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetDay(e.target.value);
  };

  return (
    <Modal
      isOpen={dietLogModal.isOpen}
      onOpenChange={dietLogModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {dietLog.id === 0 ? "New" : "Edit"} Diet Log Entry
            </ModalHeader>
            <ModalBody>
              <Select
                className="w-[7.5rem]"
                classNames={{ label: "mt-1 text-base font-semibold px-0.5" }}
                label="Day Of Diet"
                labelPlacement="outside"
                variant="faded"
                selectedKeys={[targetDay]}
                onChange={(e) => handleTargetDayChange(e)}
                disallowEmptySelection
              >
                <SelectItem key="Today">Today</SelectItem>
                <SelectItem key="Yesterday">Yesterday</SelectItem>
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={buttonAction}>
                {dietLog.id === 0 ? "Save" : "Update"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
