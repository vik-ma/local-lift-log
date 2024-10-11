import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
} from "@nextui-org/react";
import {
  CalculationListItem,
  OperationTypeWeightCalc,
  EquipmentWeight,
  Exercise,
  OperatingCalculationItem,
  OperationTypePlateCalc,
  PlateCalculatorPage,
  PresetsType,
  UseCalculationModalReturnType,
  UsePresetsListReturnType,
  UserSettings,
  WeightCalculatorPage,
  CalculationModalTab,
} from "../../typings";
import { useCallback, useMemo, useState } from "react";
import {
  ConvertNumberToTwoDecimals,
  IsStringEmpty,
  IsStringInvalidNumberOr0,
  UpdateDefaultEquipmentWeightId,
} from "../../helpers";
import { PlateCalculation } from "../PlateCalculation";
import { WeightCalculation } from "../WeightCalculation";

type CalculationModalProps = {
  useCalculationModal: UseCalculationModalReturnType;
  usePresetsList: UsePresetsListReturnType;
  doneButtonAction: (
    value: number,
    presetsType: PresetsType,
    calculationList: CalculationListItem[],
    exercise: Exercise,
    totalMultiplier: number,
    isActiveSet: boolean
  ) => void;
  multiplierIncrement: number;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const CalculationModal = ({
  useCalculationModal,
  usePresetsList,
  doneButtonAction,
  multiplierIncrement,
  userSettings,
  setUserSettings,
}: CalculationModalProps) => {
  const [calculationListWeight, setCalculationListWeight] = useState<
    CalculationListItem[]
  >([]);
  const [calculationListDistance, setCalculationListDistance] = useState<
    CalculationListItem[]
  >([]);
  const [totalMultiplierInput, setTotalMultiplierInput] = useState<string>("");
  const [isTotalMultiplierInvalid, setIsTotalMultiplierInvalid] =
    useState<boolean>(false);
  const [operatingCalculationItem, setOperatingCalculationItem] =
    useState<OperatingCalculationItem>();
  const [weightCalculatorPage, setWeightCalculatorPage] =
    useState<WeightCalculatorPage>("base");
  const [operationTypeWeightCalc, setOperationTypeWeightCalc] =
    useState<OperationTypeWeightCalc>("add-preset");

  const [plateCalculatorPage, setPlateCalculatorPage] =
    useState<PlateCalculatorPage>("base");
  const [operationTypePlateCalc, setOperationTypePlateCalc] =
    useState<OperationTypePlateCalc>("show-list");

  const {
    equipmentWeights,
    distances,
    getEquipmentWeights,
    getDistances,
    presetsType,
    isLoadingEquipment,
    isLoadingDistance,
    plateCalculatorHandle,
    setPlateCalculatorHandle,
    isDefaultHandleIdInvalid,
    setIsDefaultHandleIdInvalid,
  } = usePresetsList;

  const {
    calculationModal,
    calculationModalTab,
    setCalculationModalTab,
    calculationString,
    isActiveSet,
    calculationExercise,
    weightUnit,
    distanceUnit,
    targetWeight,
  } = useCalculationModal;

  const loadPresets = useCallback(async () => {
    if (presetsType === "equipment" && isLoadingEquipment) {
      await getEquipmentWeights(userSettings.default_equipment_weight_id);
    }

    if (presetsType === "distance" && isLoadingDistance) {
      await getDistances();
    }
  }, [
    presetsType,
    isLoadingEquipment,
    isLoadingDistance,
    getEquipmentWeights,
    getDistances,
    userSettings,
  ]);

  const {
    totalMultiplier,
    disableTotalMultiplierDecreaseButton,
    disableTotalMultiplierIncreaseButton,
  } = useMemo(() => {
    const isInputInvalid = IsStringInvalidNumberOr0(totalMultiplierInput);

    setIsTotalMultiplierInvalid(isInputInvalid);

    const multiplier =
      isInputInvalid || IsStringEmpty(totalMultiplierInput)
        ? 1
        : Number(totalMultiplierInput);

    const disableButton =
      isInputInvalid || multiplier - multiplierIncrement <= 0;

    return {
      totalMultiplier: multiplier,
      disableTotalMultiplierDecreaseButton: disableButton,
      disableTotalMultiplierIncreaseButton: isInputInvalid,
    };
  }, [totalMultiplierInput, multiplierIncrement]);

  const totalWeight = useMemo(() => {
    return calculationListWeight.reduce(
      (total, item) =>
        ConvertNumberToTwoDecimals(total + item.value * item.multiplier),
      0
    );
  }, [calculationListWeight]);

  const totalDistance = useMemo(() => {
    return calculationListDistance.reduce(
      (total, item) =>
        ConvertNumberToTwoDecimals(total + item.value * item.multiplier),
      0
    );
  }, [calculationListDistance]);

  const resultWeight = useMemo(() => {
    return ConvertNumberToTwoDecimals(totalWeight * totalMultiplier);
  }, [totalWeight, totalMultiplier]);

  const resultDistance = useMemo(() => {
    return ConvertNumberToTwoDecimals(totalDistance * totalMultiplier);
  }, [totalDistance, totalMultiplier]);

  const handleDoneButton = () => {
    if (calculationExercise === undefined) return;

    const result = presetsType === "equipment" ? resultWeight : resultDistance;

    const calculationList =
      presetsType === "equipment"
        ? calculationListWeight
        : calculationListDistance;

    doneButtonAction(
      result,
      presetsType,
      calculationList,
      calculationExercise,
      totalMultiplier,
      isActiveSet
    );
  };

  const changeHandle = (equipment: EquipmentWeight) => {
    setPlateCalculatorHandle(equipment);

    setPlateCalculatorPage("base");
    setOperationTypeWeightCalc("add-preset");
  };

  const setHandle = async (equipment: EquipmentWeight) => {
    changeHandle(equipment);

    if (isDefaultHandleIdInvalid) {
      const updatedUserSettings: UserSettings = {
        ...userSettings,
        default_equipment_weight_id: equipment.id,
      };

      await UpdateDefaultEquipmentWeightId(updatedUserSettings);
      setUserSettings(updatedUserSettings);
      setIsDefaultHandleIdInvalid(false);
    }
  };

  const handlePresetClickPlateCalc = (equipment?: EquipmentWeight) => {
    if (operationTypePlateCalc === "change-handle" && equipment !== undefined) {
      changeHandle(equipment);
    } else if (
      operationTypePlateCalc === "set-handle" &&
      equipment !== undefined
    ) {
      setHandle(equipment);
    }
  };

  const handleBackButtonWeightCalc = () => {
    if (operationTypeWeightCalc === "add-preset") {
      setWeightCalculatorPage("base");
    } else if (operationTypeWeightCalc === "change-preset") {
      setOperationTypeWeightCalc("add-preset");
      setWeightCalculatorPage("base");
      setOperatingCalculationItem(undefined);
    }
  };

  const handleBackButtonPlateCalc = () => {
    setPlateCalculatorPage("base");
  };

  const handleBackButton = () => {
    if (calculationModalTab === "weight") {
      handleBackButtonWeightCalc();
    } else if (calculationModalTab === "plate") {
      handleBackButtonPlateCalc();
    }
  };

  const handleShowPresetListPlateCalcButton = async () => {
    if (isLoadingEquipment) {
      loadPresets();
    }

    setPlateCalculatorPage("list");
  };

  const showBackButton = useMemo(() => {
    if (calculationModalTab === "weight" && weightCalculatorPage !== "base")
      return true;
    if (calculationModalTab === "plate" && plateCalculatorPage !== "base")
      return true;
    return false;
  }, [calculationModalTab, weightCalculatorPage, plateCalculatorPage]);

  const modalHeader = useMemo(() => {
    if (calculationModalTab === "weight") {
      if (weightCalculatorPage === "base") return "Weight Calculator";
      else if (weightCalculatorPage === "calc") return "Calculator";
      else {
        return operationTypeWeightCalc === "add-preset"
          ? "Add Equipment Weight"
          : "Change Equipment Weight";
      }
    } else {
      if (plateCalculatorPage === "base") {
        return "Plate Calculator";
      } else {
        return operationTypePlateCalc === "set-handle"
          ? "Set Handle"
          : operationTypePlateCalc === "change-handle"
          ? "Change Handle"
          : "Equipment Weight List";
      }
    }
  }, [
    calculationModalTab,
    weightCalculatorPage,
    plateCalculatorPage,
    operationTypeWeightCalc,
    operationTypePlateCalc,
  ]);

  return (
    <Modal
      isOpen={calculationModal.isOpen}
      onOpenChange={calculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{modalHeader}</ModalHeader>
            <ModalBody>
              <div className="h-[450px]">
                <Tabs
                  aria-label="Calculator Option"
                  classNames={{ panel: "px-0 py-1.5" }}
                  selectedKey={calculationModalTab}
                  onSelectionChange={(key) =>
                    setCalculationModalTab(key as CalculationModalTab)
                  }
                  fullWidth
                >
                  <Tab key="weight" title="Weight Calculator">
                    <WeightCalculation
                      equipmentWeights={equipmentWeights}
                      distances={distances}
                      weightUnit={weightUnit}
                      distanceUnit={distanceUnit}
                      weightCalculatorPage={weightCalculatorPage}
                      setWeightCalculatorPage={setWeightCalculatorPage}
                      calculationString={calculationString}
                      calculationListWeight={calculationListWeight}
                      setCalculationListWeight={setCalculationListWeight}
                      calculationListDistance={calculationListDistance}
                      setCalculationListDistance={setCalculationListDistance}
                      presetsType={presetsType}
                      multiplierIncrement={multiplierIncrement}
                      totalMultiplierInput={totalMultiplierInput}
                      setTotalMultiplierInput={setTotalMultiplierInput}
                      isTotalMultiplierInvalid={isTotalMultiplierInvalid}
                      totalWeight={totalWeight}
                      totalDistance={totalDistance}
                      resultWeight={resultWeight}
                      resultDistance={resultDistance}
                      disableTotalMultiplierDecreaseButton={
                        disableTotalMultiplierDecreaseButton
                      }
                      disableTotalMultiplierIncreaseButton={
                        disableTotalMultiplierIncreaseButton
                      }
                      loadPresets={loadPresets}
                      usePresetsList={usePresetsList}
                      operationTypeWeightCalc={operationTypeWeightCalc}
                      setOperationTypeWeightCalc={setOperationTypeWeightCalc}
                      operatingCalculationItem={operatingCalculationItem}
                      setOperatingCalculationItem={setOperatingCalculationItem}
                    />
                  </Tab>
                  <Tab key="plate" title="Plate Calculator">
                    <PlateCalculation
                      equipmentWeights={equipmentWeights}
                      weightUnit={weightUnit}
                      numHandlesDefaultValue={userSettings.default_num_handles.toString()}
                      plateCalculatorHandle={plateCalculatorHandle}
                      defaultTargetWeightInput={targetWeight}
                      plateCalculatorPage={plateCalculatorPage}
                      usePresetsList={usePresetsList}
                      setPlateCalculatorPage={setPlateCalculatorPage}
                      setOperationTypePlateCalc={setOperationTypePlateCalc}
                      handlePresetClickPlateCalc={handlePresetClickPlateCalc}
                    />
                  </Tab>
                </Tabs>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                {showBackButton && (
                  <Button variant="flat" onPress={handleBackButton}>
                    Back
                  </Button>
                )}
                {calculationModalTab === "plate" &&
                  plateCalculatorPage === "base" && (
                    <Button
                      variant="flat"
                      color="secondary"
                      onPress={handleShowPresetListPlateCalcButton}
                    >
                      Select Available Plates
                    </Button>
                  )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                {calculationModalTab === "weight" &&
                  weightCalculatorPage === "base" && (
                    <Button
                      color="primary"
                      isDisabled={
                        (presetsType === "equipment" && resultWeight === 0) ||
                        (presetsType === "distance" && resultDistance === 0)
                      }
                      onPress={handleDoneButton}
                    >
                      Add Result
                    </Button>
                  )}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
