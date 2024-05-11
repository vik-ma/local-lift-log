import { useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { UserSettings } from "../typings";
import {
  UpdateAllUserSettings,
  GetUserSettings,
  CreateDefaultUserSettings,
  CreateDefaultExerciseList,
  CreateDefaultEquipmentWeights,
  CreateDefaultMeasurementList,
  CreateDefaultDistances,
} from "../helpers";
import { LocaleDropdown } from "../components";

export default function HomePage() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isUserSettingsLoaded, setIsUserSettingsLoaded] =
    useState<boolean>(false);
  const [unitType, setUnitType] = useState<string>("metric");
  const [locale, setLocale] = useState<string>("en-GB");

  const navigate = useNavigate();

  const initialized = useRef(false);

  const setUnitsModal = useDisclosure();

  const createDefaultUserSettings = async () => {
    const useMetricUnits: boolean = unitType === "metric" ? true : false;

    const defaultUserSettings: UserSettings | undefined =
      await CreateDefaultUserSettings(useMetricUnits, locale);

    // Create Default User Settings
    if (defaultUserSettings !== undefined) {
      await UpdateAllUserSettings(defaultUserSettings);
      setUserSettings(defaultUserSettings);
    }

    // Create Default Exercise List
    await CreateDefaultExerciseList();

    // Create Default Equipment Weights
    await CreateDefaultEquipmentWeights(useMetricUnits);

    // Create Default Measurement List
    await CreateDefaultMeasurementList(useMetricUnits);

    // Create Default Distance List
    await CreateDefaultDistances(useMetricUnits);

    setIsUserSettingsLoaded(true);
    setUnitsModal.onClose();
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      if (isUserSettingsLoaded) return;

      try {
        const settings: UserSettings | undefined = await GetUserSettings();
        if (settings !== undefined) {
          // If UserSettings exists
          setUserSettings(settings);
          setIsUserSettingsLoaded(true);
        } else {
          // If no UserSettings exists

          // Stop useEffect running twice in dev
          if (!initialized.current) {
            initialized.current = true;
          } else return;

          setUnitsModal.onOpen();
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
  }, [setUnitsModal, isUserSettingsLoaded]);

  return (
    <>
      <Modal
        isOpen={setUnitsModal.isOpen}
        onOpenChange={setUnitsModal.onOpenChange}
        isDismissable={false}
        hideCloseButton={true}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Select Units And Date Style
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3 items-center justify-between">
                    <span className="text-lg">Unit Type</span>
                    <Select
                      aria-label="Unit Type Dropdown List"
                      className="w-32"
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
                    <span className="text-lg">Date Style</span>
                    <LocaleDropdown
                      value={locale}
                      setState={setLocale}
                      targetType="state"
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  onPress={() => createDefaultUserSettings()}
                >
                  Done
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Home
          </h1>
        </div>
        <div className="flex justify-center">
          <Button
            className="font-medium"
            size="lg"
            color="primary"
            onPress={() => navigate("/test")}
          >
            GO TO TEST PAGE
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center gap-2">
          <p>Settings Id: {userSettings?.id}</p>
          <p>Active Routine Id: {userSettings?.active_routine_id}</p>
        </div>
      </div>
    </>
  );
}
