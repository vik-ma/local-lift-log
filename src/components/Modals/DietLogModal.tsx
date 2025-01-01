import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DatePicker,
  CalendarDate,
} from "@nextui-org/react";
import { DietLog, UseDisclosureReturnType, UserSettings } from "../../typings";
import { I18nProvider } from "@react-aria/i18n";

type DietLogModalProps = {
  dietLogModal: UseDisclosureReturnType;
  dietLog: DietLog;
  setDietLog: React.Dispatch<React.SetStateAction<DietLog>>;
  selectedDate: CalendarDate | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<CalendarDate | null>>;
  userSettings: UserSettings;
  buttonAction: () => void;
};

export const DietLogModal = ({
  dietLogModal,
  dietLog,
  setDietLog,
  selectedDate,
  setSelectedDate,
  userSettings,
  buttonAction,
}: DietLogModalProps) => {
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
              <I18nProvider locale={userSettings.locale}>
                <DatePicker
                  classNames={{ base: "gap-0.5" }}
                  dateInputClassNames={{ inputWrapper: "!bg-default-100" }}
                  label={
                    <span className="text-lg font-semibold px-0.5">Date</span>
                  }
                  labelPlacement="outside"
                  variant="faded"
                  value={selectedDate}
                  onChange={setSelectedDate}
                />
              </I18nProvider>
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
