import { useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
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

export default function HomePage() {
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [isUserSettingsLoaded, setIsUserSettingsLoaded] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const initialized = useRef(false);

  const setUnitsModal = useDisclosure();

  const createDefaultUserSettings = async (useMetricUnits: boolean) => {
    const defaultUserSettings: UserSettings | undefined =
      await CreateDefaultUserSettings(useMetricUnits);

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
                Choose Units
              </ModalHeader>
              <ModalBody>
                <p>Do you want to use Metric or Imperial units?</p>
              </ModalBody>
              <ModalFooter className="flex justify-center gap-5">
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={() => createDefaultUserSettings(true)}
                >
                  Metric
                </Button>
                <Button
                  className="text-lg font-medium"
                  size="lg"
                  color="primary"
                  onPress={() => createDefaultUserSettings(false)}
                >
                  Imperial
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
