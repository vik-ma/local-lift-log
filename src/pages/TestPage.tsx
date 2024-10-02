import { useEffect, useState } from "react";
import { useCalculationModal, usePresetsList } from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import {
  CalculationModal,
  LoadingSpinner,
  TextInputModal,
} from "../components";
import {
  CalculationListItem,
  Exercise,
  PresetsType,
  UserSettings,
} from "../typings";
import { GetUserSettings } from "../helpers";

export default function Test() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  const [userSettings, setUserSettings] = useState<UserSettings>();

  const calculationModal = useCalculationModal();
  const textInputModal = useDisclosure();

  const presetsList = usePresetsList(false, false);

  const doneButtonAction = async (
    value: number,
    presetsType: PresetsType,
    calculationList: CalculationListItem[],
    exercise: Exercise,
    totalMultiplier: number,
    isActiveSet: boolean
  ) => {
    console.log(
      value,
      presetsType,
      calculationList,
      exercise,
      totalMultiplier,
      isActiveSet
    );
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();
      if (userSettings === undefined) return;
      setUserSettings(userSettings);
    };

    loadUserSettings();
  }, []);

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <TextInputModal
        textInputModal={textInputModal}
        value={text}
        setValue={setText}
        label="Test"
        header="TEST"
        buttonAction={() => calculationModal.calculationModal.onOpen()}
      />
      <CalculationModal
        useCalculationModal={calculationModal}
        usePresetsList={presetsList}
        doneButtonAction={doneButtonAction}
        multiplierIncrement={2}
        userSettings={userSettings}
      />
      <div className="flex flex-col gap-2">
        <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            TEST
          </h1>
        </div>
        <Button onPress={() => calculationModal.calculationModal.onOpen()}>
          Open Calculation Modal
        </Button>
        <div className="flex gap-1 justify-center">
          <Button color="primary" size="sm" variant="flat">
            Primary
          </Button>
          <Button color="secondary" size="sm" variant="flat">
            Secondary
          </Button>
          <Button color="danger" size="sm" variant="flat">
            Danger
          </Button>
          <Button color="success" size="sm" variant="flat">
            Success
          </Button>
        </div>
        <div className="flex flex-col bg-white border border-black overflow-auto mb-20">
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
          Test
          <br />
        </div>
        <div
          className={
            isExpanded
              ? "fixed bottom-0 top-16 bg-red-500 w-[400px]"
              : "fixed bottom-0 bg-red-500 h-20 w-[400px]"
          }
        >
          <button
            className="h-20 w-[400px] cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          ></button>
        </div>
      </div>
    </>
  );
}
