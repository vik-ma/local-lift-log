import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  CalculationListItem,
  OperationTypeSumCalc,
  EquipmentWeight,
  Exercise,
  OperatingCalculationItem,
  OperationTypePlateCalc,
  PlateCalculatorPage,
  PresetsType,
  UseCalculationModalReturnType,
  UsePresetsListReturnType,
  UserSettings,
  SumCalculatorPage,
  CalculationModalTab,
  PlateCollection,
  StoreRef,
  EquipmentWeightSortCategory,
  DistanceSortCategory,
} from "../../typings";
import { useEffect, useMemo, useState } from "react";
import {
  ConvertNumberToTwoDecimals,
  GetSortCategory,
  IsStringEmpty,
  IsStringInvalidNumber,
} from "../../helpers";
import { PlateCalculator, SumCalculator } from "..";

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
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
  store: StoreRef;
};

export const CalculationModal = ({
  useCalculationModal,
  usePresetsList,
  doneButtonAction,
  userSettings,
  setUserSettings,
  store,
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
  const [sumCalculatorPage, setSumCalculatorPage] =
    useState<SumCalculatorPage>("base");
  const [operationTypeSumCalc, setOperationTypeSumCalc] =
    useState<OperationTypeSumCalc>("add-preset");
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
    isEquipmentWeightListLoaded,
    isDistanceListLoaded,
    operatingPlateCollection,
    setOperatingPlateCollection,
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
    targetWeightInput,
    setTargetWeightInput,
  } = useCalculationModal;

  const loadPresets = async () => {
    const sortCategory = await GetSortCategory(
      store,
      presetsType === "equipment"
        ? ("favorite" as EquipmentWeightSortCategory)
        : ("favorite" as DistanceSortCategory),
      presetsType === "equipment" ? "equipment-weights" : "distances"
    );

    if (presetsType === "equipment" && !isEquipmentWeightListLoaded.current) {
      await getEquipmentWeights(
        sortCategory as EquipmentWeightSortCategory,
        userSettings.default_plate_collection_id
      );
    }

    if (presetsType === "distance" && !isDistanceListLoaded.current) {
      await getDistances(sortCategory as DistanceSortCategory);
    }
  };

  const {
    totalMultiplier,
    disableTotalMultiplierDecreaseButton,
    disableTotalMultiplierIncreaseButton,
  } = useMemo(() => {
    const isInputInvalid = IsStringInvalidNumber(totalMultiplierInput, 0, true);

    setIsTotalMultiplierInvalid(isInputInvalid);

    const multiplier =
      isInputInvalid || IsStringEmpty(totalMultiplierInput)
        ? 1
        : Number(totalMultiplierInput);

    const disableButton =
      isInputInvalid ||
      multiplier - userSettings.default_increment_calculation_multiplier <= 0;

    return {
      totalMultiplier: multiplier,
      disableTotalMultiplierDecreaseButton: disableButton,
      disableTotalMultiplierIncreaseButton:
        isInputInvalid && !IsStringEmpty(totalMultiplierInput),
    };
  }, [
    totalMultiplierInput,
    userSettings.default_increment_calculation_multiplier,
  ]);

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

  const handlePresetClickSetHandle = (equipment?: EquipmentWeight) => {
    if (equipment === undefined) return;

    const updatedOperatingPlateCollection: PlateCollection = {
      ...operatingPlateCollection,
      handle: equipment,
    };

    setOperatingPlateCollection(updatedOperatingPlateCollection);

    setPlateCalculatorPage("base");
    setOperationTypeSumCalc("add-preset");
  };

  const handleBackButtonWeightCalc = () => {
    if (operationTypeSumCalc === "add-preset") {
      setSumCalculatorPage("base");
    } else if (operationTypeSumCalc === "change-preset") {
      setOperationTypeSumCalc("add-preset");
      setSumCalculatorPage("base");
      setOperatingCalculationItem(undefined);
    }
  };

  const handleBackButtonPlateCalc = () => {
    setPlateCalculatorPage("base");
    setOperationTypePlateCalc("show-list");
  };

  const handleBackButton = () => {
    if (calculationModalTab === "sum") {
      handleBackButtonWeightCalc();
    } else if (calculationModalTab === "plate") {
      handleBackButtonPlateCalc();
    }
  };

  useEffect(() => {
    if (
      calculationModal.isOpen &&
      calculationModalTab === "plate" &&
      !isEquipmentWeightListLoaded.current
    ) {
      loadPresets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculationModal.isOpen, calculationModalTab]);

  const showBackButton = useMemo(() => {
    if (calculationModalTab === "sum" && sumCalculatorPage !== "base")
      return true;
    if (calculationModalTab === "plate" && plateCalculatorPage !== "base")
      return true;
    return false;
  }, [calculationModalTab, sumCalculatorPage, plateCalculatorPage]);

  const modalHeader = useMemo(() => {
    if (calculationModalTab === "sum") {
      if (sumCalculatorPage === "base") return "Sum Calculator";
      else if (sumCalculatorPage === "calc") return "Calculator";
      else {
        return operationTypeSumCalc === "add-preset"
          ? "Add Equipment Weight"
          : "Change Equipment Weight";
      }
    } else {
      if (plateCalculatorPage === "base") {
        return "Plate Calculator";
      } else {
        return operationTypePlateCalc === "set-handle"
          ? "Set Handle"
          : "Set Available Plates";
      }
    }
  }, [
    calculationModalTab,
    sumCalculatorPage,
    plateCalculatorPage,
    operationTypeSumCalc,
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
              <div className="h-[440px]">
                <Tabs
                  aria-label="Calculator Options"
                  classNames={{ panel: "px-0 py-1.5" }}
                  selectedKey={calculationModalTab}
                  onSelectionChange={(key) =>
                    setCalculationModalTab(key as CalculationModalTab)
                  }
                  disabledKeys={presetsType === "distance" ? ["plate"] : []}
                  fullWidth
                >
                  <Tab key="plate" title="Plates">
                    <PlateCalculator
                      operatingPlateCollection={operatingPlateCollection}
                      setOperatingPlateCollection={setOperatingPlateCollection}
                      plateCalculatorPage={plateCalculatorPage}
                      usePresetsList={usePresetsList}
                      operationTypePlateCalc={operationTypePlateCalc}
                      setOperationTypePlateCalc={setOperationTypePlateCalc}
                      handlePresetClickSetHandle={handlePresetClickSetHandle}
                      targetWeightInput={targetWeightInput}
                      setTargetWeightInput={setTargetWeightInput}
                      setPlateCalculatorPage={setPlateCalculatorPage}
                      userSettings={userSettings}
                      setUserSettings={setUserSettings}
                    />
                  </Tab>
                  <Tab key="sum" title="Sum">
                    <SumCalculator
                      equipmentWeights={equipmentWeights}
                      distances={distances}
                      weightUnit={weightUnit}
                      distanceUnit={distanceUnit}
                      sumCalculatorPage={sumCalculatorPage}
                      setSumCalculatorPage={setSumCalculatorPage}
                      calculationString={calculationString}
                      calculationListWeight={calculationListWeight}
                      setCalculationListWeight={setCalculationListWeight}
                      calculationListDistance={calculationListDistance}
                      setCalculationListDistance={setCalculationListDistance}
                      presetsType={presetsType}
                      multiplierIncrement={
                        userSettings.default_increment_calculation_multiplier
                      }
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
                      OperationTypeSumCalc={operationTypeSumCalc}
                      setOperationTypeSumCalc={setOperationTypeSumCalc}
                      operatingCalculationItem={operatingCalculationItem}
                      setOperatingCalculationItem={setOperatingCalculationItem}
                    />
                  </Tab>
                </Tabs>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                {calculationModalTab === "plate" &&
                  plateCalculatorPage === "base" && (
                    <Button
                      variant="flat"
                      color="secondary"
                      onPress={() => setPlateCalculatorPage("plate-calc-list")}
                    >
                      Load Plate Collection
                    </Button>
                  )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={showBackButton ? handleBackButton : onClose}
                >
                  {showBackButton ? "Back" : "Close"}
                </Button>
                {calculationModalTab === "sum" &&
                  sumCalculatorPage === "base" && (
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
