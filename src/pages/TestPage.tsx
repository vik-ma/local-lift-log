import { useState } from "react";
import { useCalculationModal, usePresetsList } from "../hooks";
import { Button, useDisclosure } from "@nextui-org/react";
import { CalculationModal, TextInputModal } from "../components";

export default function Test() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  const calculationModal = useCalculationModal();
  const textInputModal = useDisclosure();

  const presetsList = usePresetsList(false, false);

  const doneButtonAction = async (
    value: number,
    isWeight: boolean,
    isActiveSet: boolean
  ) => {
    console.log(value, isWeight, isActiveSet);
  };

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
        weightUnit="kg"
        distanceUnit="km"
        multiplierIncrement={2}
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
