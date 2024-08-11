import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { ClockStyleDropdown, LocaleDropdown } from "../../components";
import { useState, ReactNode } from "react";

type SettingsModalProps = {
  settingsModal: ReturnType<typeof useDisclosure>;
  doneButtonAction: (
    unitType: string,
    locale: string,
    clockStyle: string
  ) => void;
  header?: string;
  extraContent?: ReactNode;
  doneButtonText?: string;
  isDismissible?: boolean;
  isRestoreSettings?: boolean;
};

export const SettingsModal = ({
  settingsModal,
  doneButtonAction,
  header = "Choose Settings",
  extraContent,
  doneButtonText = "Done",
  isDismissible = false,
  isRestoreSettings = false,
}: SettingsModalProps) => {
  const [unitType, setUnitType] = useState<string>("metric");
  const [locale, setLocale] = useState<string>("en-GB");
  const [clockStyle, setClockStyle] = useState<string>("24h");
  return (
    <Modal
      isOpen={settingsModal.isOpen}
      onOpenChange={settingsModal.onOpenChange}
      isDismissable={isDismissible}
      isKeyboardDismissDisabled={isDismissible ? false : true}
      hideCloseButton={isDismissible ? false : true}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                {extraContent}
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-3 items-center justify-between">
                    <span className="text-lg">Unit Type</span>
                    <Select
                      aria-label="Unit Type Dropdown List"
                      className="w-[9.5rem]"
                      variant="faded"
                      selectedKeys={[unitType]}
                      onChange={(e) => setUnitType(e.target.value)}
                      disallowEmptySelection
                    >
                      <SelectItem key="metric" value="metric">
                        Metric
                      </SelectItem>
                      <SelectItem key="imperial" value="imperial">
                        Imperial
                      </SelectItem>
                    </Select>
                  </div>
                  <div className="flex gap-3 items-center justify-between">
                    <span className="text-lg">Date Format</span>
                    <LocaleDropdown
                      value={locale}
                      setState={setLocale}
                      targetType="state"
                    />
                  </div>
                  <div className="flex gap-3 items-center justify-between">
                    <span className="text-lg">Clock Format</span>
                    <ClockStyleDropdown
                      value={clockStyle}
                      setState={setClockStyle}
                      targetType="state"
                    />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {isDismissible && (
                <Button
                  color={isRestoreSettings ? "danger" : "primary"}
                  variant="light"
                  onPress={onClose}
                >
                  Close
                </Button>
              )}
              <Button
                color={isRestoreSettings ? "danger" : "primary"}
                onPress={() => doneButtonAction(unitType, locale, clockStyle)}
              >
                {doneButtonText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
