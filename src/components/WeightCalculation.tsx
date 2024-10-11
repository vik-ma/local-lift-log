import { Button, Input, ScrollShadow } from "@nextui-org/react";
import {
  Calculator,
  EmptyListLabel,
  PlusAndMinusButtons,
  PresetsModalList,
} from ".";
import { CrossCircleIcon } from "../assets";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ConvertDistanceValue,
  ConvertInputStringToNumber,
  ConvertNumberToTwoDecimals,
  ConvertWeightValue,
  CreateNewCalculationItem,
  IsCalculationStringValid,
  IsStringEmpty,
  IsStringInvalidNumberOr0,
  LoadCalculationString,
} from "../helpers";
import {
  CalculationListItem,
  Distance,
  EquipmentWeight,
  OperatingCalculationItem,
  OperationTypeWeightCalc,
  PresetsType,
  UsePresetsListReturnType,
  WeightCalculatorPage,
} from "../typings";

type WeightCalculationProps = {
  equipmentWeights: EquipmentWeight[];
  distances: Distance[];
  weightUnit: string;
  distanceUnit: string;
  weightCalculatorPage: WeightCalculatorPage;
  calculationString: string;
  calculationListWeight: CalculationListItem[];
  setCalculationListWeight: React.Dispatch<
    React.SetStateAction<CalculationListItem[]>
  >;
  calculationListDistance: CalculationListItem[];
  setCalculationListDistance: React.Dispatch<
    React.SetStateAction<CalculationListItem[]>
  >;
  presetsType: PresetsType;
  multiplierIncrement: number;
  totalMultiplierInput: string;
  setTotalMultiplierInput: React.Dispatch<React.SetStateAction<string>>;
  isTotalMultiplierInvalid: boolean;
  totalWeight: number;
  totalDistance: number;
  resultWeight: number;
  resultDistance: number;
  disableTotalMultiplierDecreaseButton: boolean;
  disableTotalMultiplierIncreaseButton: boolean;
  loadPresets: () => Promise<void>;
  usePresetsList: UsePresetsListReturnType;
  operationTypeWeightCalc: OperationTypeWeightCalc;
  setOperationTypeWeightCalc: React.Dispatch<
    React.SetStateAction<OperationTypeWeightCalc>
  >;
};

export const WeightCalculation = ({
  equipmentWeights,
  distances,
  weightUnit,
  distanceUnit,
  weightCalculatorPage,
  calculationString,
  calculationListWeight,
  setCalculationListWeight,
  calculationListDistance,
  setCalculationListDistance,
  presetsType,
  multiplierIncrement,
  totalMultiplierInput,
  setTotalMultiplierInput,
  isTotalMultiplierInvalid,
  totalWeight,
  totalDistance,
  resultWeight,
  resultDistance,
  disableTotalMultiplierDecreaseButton,
  disableTotalMultiplierIncreaseButton,
  loadPresets,
  usePresetsList,
  operationTypeWeightCalc,
  setOperationTypeWeightCalc,
}: WeightCalculationProps) => {
  const [isCalculationInvalid, setIsCalculationInvalid] =
    useState<boolean>(true);
  const [showNumberInput, setShowNumberInput] = useState<boolean>(false);
  const [numberInput, setNumberInput] = useState<string>("");
  const [operatingCalculationItem, setOperatingCalculationItem] =
    useState<OperatingCalculationItem>();

  const isNumberInputInvalid = useMemo(() => {
    return IsStringEmpty(numberInput) || IsStringInvalidNumberOr0(numberInput);
  }, [numberInput]);

  const numberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (calculationString === null) {
      if (presetsType === "equipment") {
        setCalculationListWeight([]);
      } else {
        setCalculationListDistance([]);
      }

      setTotalMultiplierInput("");

      return;
    }

    loadPresets();

    const unit = presetsType === "equipment" ? weightUnit : distanceUnit;

    const { calculationList, totalMultiplier } = LoadCalculationString(
      calculationString,
      unit,
      presetsType,
      equipmentWeights,
      distances
    );

    const totalMultiplierInput =
      totalMultiplier === 1 ? "" : totalMultiplier.toString();

    setTotalMultiplierInput(totalMultiplierInput);

    if (presetsType === "equipment") {
      setCalculationListWeight(calculationList);
    } else {
      setCalculationListDistance(calculationList);
    }
  }, [
    calculationString,
    presetsType,
    equipmentWeights,
    distances,
    weightUnit,
    distanceUnit,
    loadPresets,
    setTotalMultiplierInput,
    setCalculationListWeight,
    setCalculationListDistance,
  ]);

  const addItemToCalculationList = (calculationItem: CalculationListItem) => {
    if (presetsType === "equipment") {
      const updatedCalculationListWeight = [
        ...calculationListWeight,
        calculationItem,
      ];

      setCalculationListWeight(updatedCalculationListWeight);
    }

    if (presetsType === "distance") {
      const updatedCalculationListDistance = [
        ...calculationListDistance,
        calculationItem,
      ];

      setCalculationListDistance(updatedCalculationListDistance);
    }
  };

  const editItemInCalculationList = (
    updatedCalculationItem: CalculationListItem
  ) => {
    if (operatingCalculationItem === undefined) return;

    if (presetsType === "equipment") {
      if (calculationListWeight[operatingCalculationItem.index] === undefined)
        return;

      const updatedCalculationList = [...calculationListWeight];

      updatedCalculationList[operatingCalculationItem.index] =
        updatedCalculationItem;

      setCalculationListWeight(updatedCalculationList);
    } else {
      if (calculationListDistance[operatingCalculationItem.index] === undefined)
        return;

      const updatedCalculationList = [...calculationListDistance];

      updatedCalculationList[operatingCalculationItem.index] =
        updatedCalculationItem;

      setCalculationListDistance(updatedCalculationList);
    }
  };

  const handleAddPresetButton = async () => {
    await loadPresets();

    // TODO: FIX
    // setCalculationModalPage("list");
    setShowNumberInput(false);
    setOperatingCalculationItem(undefined);
    setOperationTypeWeightCalc("add-preset");
  };

  const handleGoToCalculationButton = () => {
    // TODO: FIX
    // setCalculationModalPage("calc");
    setShowNumberInput(false);
    setOperatingCalculationItem(undefined);
  };

  const handlePresetClick = (
    equipment?: EquipmentWeight,
    distance?: Distance
  ) => {
    if (operationTypeWeightCalc === "add-preset") {
      addPreset(equipment, distance);
    } else if (operationTypeWeightCalc === "change-preset") {
      changePreset(equipment, distance);
    }
  };

  const addPreset = (equipment?: EquipmentWeight, distance?: Distance) => {
    if (equipment !== undefined) {
      const calculationItem = CreateNewCalculationItem(
        "preset",
        weightUnit,
        1,
        undefined,
        undefined,
        equipment
      );

      if (calculationItem === undefined) return;

      addItemToCalculationList(calculationItem);
    }

    if (distance !== undefined) {
      const calculationItem = CreateNewCalculationItem(
        "preset",
        distanceUnit,
        1,
        undefined,
        undefined,
        undefined,
        distance
      );

      if (calculationItem === undefined) return;

      addItemToCalculationList(calculationItem);
    }

    // TODO: FIX
    // setCalculationModalPage("base");
  };

  const changePreset = (equipment?: EquipmentWeight, distance?: Distance) => {
    if (operatingCalculationItem === undefined) return;

    if (equipment !== undefined) {
      const updatedCalculationItem: CalculationListItem = {
        ...operatingCalculationItem.calculationItem,
        value: equipment.weight,
        label: equipment.name,
        unit: equipment.weight_unit,
      };

      if (equipment.weight_unit !== weightUnit) {
        const newValue = ConvertWeightValue(
          equipment.weight,
          equipment.weight_unit,
          weightUnit
        );
        updatedCalculationItem.value = newValue;
        updatedCalculationItem.unit = weightUnit;
      }

      editItemInCalculationList(updatedCalculationItem);
    }

    if (distance !== undefined) {
      const updatedCalculationItem: CalculationListItem = {
        ...operatingCalculationItem.calculationItem,
        value: distance.distance,
        label: distance.name,
        unit: distance.distance_unit,
      };

      if (distance.distance_unit !== distanceUnit) {
        const newValue = ConvertDistanceValue(
          distance.distance,
          distance.distance_unit,
          distanceUnit
        );
        updatedCalculationItem.value = newValue;
        updatedCalculationItem.unit = distanceUnit;
      }

      editItemInCalculationList(updatedCalculationItem);
    }

    setOperatingCalculationItem(undefined);
    // TODO: FIX
    // setCalculationModalPage("base");
  };

  const handleRemoveButton = (index: number) => {
    if (presetsType === "equipment") {
      const updatedCalculationListWeight = [...calculationListWeight];

      updatedCalculationListWeight.splice(index, 1);

      setCalculationListWeight(updatedCalculationListWeight);
    }

    if (presetsType === "distance") {
      const updatedCalculationListDistance = [...calculationListDistance];

      updatedCalculationListDistance.splice(index, 1);

      setCalculationListDistance(updatedCalculationListDistance);
    }
  };

  const handleClearAllButton = () => {
    if (presetsType === "equipment") {
      setCalculationListWeight([]);
    }

    if (presetsType === "distance") {
      setCalculationListDistance([]);
    }

    setTotalMultiplierInput("");
  };

  const showClearAllButton = useMemo(() => {
    if (presetsType === "equipment") {
      return (
        calculationListWeight.length !== 0 ||
        !IsStringEmpty(totalMultiplierInput)
      );
    } else {
      return (
        calculationListDistance.length !== 0 ||
        !IsStringEmpty(totalMultiplierInput)
      );
    }
  }, [
    presetsType,
    calculationListWeight,
    calculationListDistance,
    totalMultiplierInput,
  ]);

  const presetText = useMemo(() => {
    return presetsType === "equipment" ? "Weight" : "Distance";
  }, [presetsType]);

  const handleWeightMultiplierChange = (
    value: string,
    weight: CalculationListItem,
    index: number
  ) => {
    const isInputInvalid = IsStringInvalidNumberOr0(value);

    const multiplier =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const disableDecreaseButton =
      isInputInvalid || multiplier - multiplierIncrement <= 0;
    const disableIncreaseButton = isInputInvalid;

    const updatedCalculationItem = {
      ...weight,
      multiplierInput: value,
      multiplier: multiplier,
      isMultiplierInputInvalid: isInputInvalid,
      disableDecreaseMultiplierButton: disableDecreaseButton,
      disableIncreaseMultiplierButton: disableIncreaseButton,
    };

    const updatedCalculationListWeight = [...calculationListWeight];

    updatedCalculationListWeight[index] = updatedCalculationItem;

    setCalculationListWeight(updatedCalculationListWeight);
  };

  const handleDistanceMultiplierChange = (
    value: string,
    distance: CalculationListItem,
    index: number
  ) => {
    const isInputInvalid = IsStringInvalidNumberOr0(value);

    const multiplier =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const disableDecreaseButton =
      isInputInvalid || multiplier - multiplierIncrement <= 0;
    const disableIncreaseButton = isInputInvalid;

    const updatedCalculationItem = {
      ...distance,
      multiplierInput: value,
      multiplier: multiplier,
      isMultiplierInputInvalid: isInputInvalid,
      disableDecreaseMultiplierButton: disableDecreaseButton,
      disableIncreaseMultiplierButton: disableIncreaseButton,
    };

    const updatedCalculationListDistance = [...calculationListDistance];

    updatedCalculationListDistance[index] = updatedCalculationItem;

    setCalculationListDistance(updatedCalculationListDistance);
  };

  const incrementMultiplier = (
    key: string,
    isIncrease: boolean,
    calculationItem?: CalculationListItem,
    index?: number
  ) => {
    const modifier = isIncrease ? 1 : -1;

    switch (key) {
      case "total": {
        if (isTotalMultiplierInvalid) return;

        const totalInputNum = IsStringEmpty(totalMultiplierInput)
          ? 1
          : ConvertInputStringToNumber(totalMultiplierInput);

        const newValue = parseFloat(
          (totalInputNum + modifier * multiplierIncrement).toFixed(2)
        );

        const updatedInput = newValue === 1 ? "" : newValue.toString();
        setTotalMultiplierInput(updatedInput);

        break;
      }
      case "list": {
        if (calculationItem === undefined || index === undefined) return;

        const inputNum = IsStringEmpty(calculationItem.multiplierInput)
          ? 1
          : ConvertInputStringToNumber(calculationItem.multiplierInput);

        const newValue = parseFloat(
          (inputNum + modifier * multiplierIncrement).toFixed(2)
        );

        const updatedInput = newValue === 1 ? "" : newValue.toString();

        if (presetsType === "equipment") {
          handleWeightMultiplierChange(updatedInput, calculationItem, index);
        } else if (presetsType === "distance") {
          handleDistanceMultiplierChange(updatedInput, calculationItem, index);
        }

        break;
      }
      default:
        break;
    }
  };

  const addCalculationString = (calculationString: string) => {
    const { isCalculationValid, result } =
      IsCalculationStringValid(calculationString);

    if (isCalculationInvalid || !isCalculationValid) return;

    if (operatingCalculationItem === undefined) {
      // Add new calculationItem to list
      const unit = presetsType === "equipment" ? weightUnit : distanceUnit;

      const calculationItem = CreateNewCalculationItem(
        "calculation",
        unit,
        1,
        result,
        calculationString
      );

      if (calculationItem === undefined) return;

      addItemToCalculationList(calculationItem);
    } else {
      // Edit operatingCalculationItem
      const updatedCalculationItem: CalculationListItem = {
        ...operatingCalculationItem.calculationItem,
        value: result,
        label: calculationString,
      };

      editItemInCalculationList(updatedCalculationItem);
    }

    setOperatingCalculationItem(undefined);
    // TODO: FIX
    // setCalculationModalPage("base");
  };

  const handleAddNumberButton = () => {
    setShowNumberInput(!showNumberInput);

    if (operatingCalculationItem !== undefined)
      setOperatingCalculationItem(undefined);
  };

  const addNumberCalculationItem = () => {
    if (isNumberInputInvalid) return;

    const unit = presetsType === "equipment" ? weightUnit : distanceUnit;

    const value = ConvertNumberToTwoDecimals(Number(numberInput));

    if (operatingCalculationItem === undefined) {
      // Add new calculationItem to list
      const calculationItem = CreateNewCalculationItem(
        "number",
        unit,
        1,
        value
      );

      if (calculationItem === undefined) return;

      addItemToCalculationList(calculationItem);
    } else {
      // Edit operatingCalculationItem
      const updatedCalculationItem: CalculationListItem = {
        ...operatingCalculationItem.calculationItem,
        value: value,
        label: `${value} ${unit}`,
      };

      editItemInCalculationList(updatedCalculationItem);
    }

    setNumberInput("");
    setShowNumberInput(false);
    setOperatingCalculationItem(undefined);
  };

  const handleCancelNumberInputButton = () => {
    setShowNumberInput(false);
    setOperatingCalculationItem(undefined);
  };

  const handleClickCalculationItem = (
    calculationItem: CalculationListItem,
    index: number
  ) => {
    setOperatingCalculationItem({ calculationItem, index });

    // TODO: FIX
    // if (calculationItem.itemType === "calculation") {
    //   setCalculationModalPage("calc");
    //   setShowNumberInput(false);
    // } else if (calculationItem.itemType === "number") {
    //   setNumberInput(calculationItem.value.toString());
    //   setShowNumberInput(true);
    // } else if (calculationItem.itemType === "preset") {
    //   setCalculationModalPage("list");
    //   setOperationTypeWeightCalc("change-preset");
    //   setShowNumberInput(false);
    // }
  };

  useEffect(() => {
    if (showNumberInput && numberInputRef.current) {
      numberInputRef.current.focus();
    }
  }, [showNumberInput]);

  return (
    <>
      {weightCalculatorPage === "base" ? (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between pb-1">
            <div className="flex gap-1">
              <Button size="sm" variant="flat" onPress={handleAddPresetButton}>
                Add Preset
              </Button>
              <Button
                color={showNumberInput ? "secondary" : "default"}
                size="sm"
                variant="flat"
                onPress={handleAddNumberButton}
              >
                Add {presetText}
              </Button>
              <Button
                size="sm"
                variant="flat"
                onPress={handleGoToCalculationButton}
              >
                Add Calculation
              </Button>
            </div>
            {showClearAllButton && (
              <Button
                variant="flat"
                size="sm"
                color="danger"
                onPress={handleClearAllButton}
              >
                Clear All
              </Button>
            )}
          </div>
          {showNumberInput && (
            <div className="flex gap-1 items-center justify-between">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-stone-500">
                  {operatingCalculationItem === undefined ? "New" : "Edit"}{" "}
                  {presetText}
                </span>
                <Input
                  ref={numberInputRef}
                  className="w-[6rem]"
                  aria-label={`Add ${presetText} Value Input Field`}
                  size="sm"
                  variant="faded"
                  isInvalid={isNumberInputInvalid}
                  isClearable
                  value={numberInput}
                  onValueChange={setNumberInput}
                />
                <Button
                  color="secondary"
                  variant="flat"
                  size="sm"
                  isDisabled={isNumberInputInvalid}
                  onPress={addNumberCalculationItem}
                >
                  {operatingCalculationItem === undefined ? "Add" : "Save"}
                </Button>
              </div>
              <div>
                <Button
                  variant="flat"
                  size="sm"
                  onPress={handleCancelNumberInputButton}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          {presetsType === "equipment" ? (
            <>
              <div className="flex px-0.5 text-sm font-medium">
                <span>Weight</span>
                <span className="pl-[12.75rem]">Multiplier</span>
              </div>
              <ScrollShadow
                className={
                  showNumberInput
                    ? "flex flex-col gap-1.5 h-[244px]"
                    : "flex flex-col gap-1.5 h-[280px]"
                }
              >
                {calculationListWeight.map((weight, index) => (
                  <div
                    key={`calculation-list-weight-${index}`}
                    className="flex gap-1.5 items-center"
                  >
                    <button
                      className="flex w-[13.25rem] justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg"
                      onClick={() => handleClickCalculationItem(weight, index)}
                    >
                      <span className="w-[7rem] truncate text-left">
                        {weight.label}
                      </span>
                      <div className="flex gap-1 text-secondary">
                        <span className="w-[3.5rem] truncate text-right">
                          {weight.value}
                        </span>
                        <span>{weight.unit}</span>
                      </div>
                    </button>
                    <div className="flex gap-0.5 select-none">
                      <Input
                        aria-label={`${weight.label} Multiplier Input`}
                        className="w-[4rem] order-2"
                        size="sm"
                        variant="faded"
                        value={weight.multiplierInput}
                        isInvalid={weight.isMultiplierInputInvalid}
                        onValueChange={(value) =>
                          handleWeightMultiplierChange(value, weight, index)
                        }
                        isClearable
                      />
                      <PlusAndMinusButtons
                        trackingValue={"list"}
                        updateValue={incrementMultiplier}
                        isDecreaseDisabled={
                          weight.disableDecreaseMultiplierButton
                        }
                        isIncreaseDisabled={
                          weight.disableIncreaseMultiplierButton
                        }
                        calculationItem={weight}
                        index={index}
                        wrapAround
                      />
                    </div>
                    <Button
                      aria-label={`Remove ${weight.label} From Calculation List`}
                      size="sm"
                      color="danger"
                      isIconOnly
                      variant="light"
                      onPress={() => handleRemoveButton(index)}
                    >
                      <CrossCircleIcon size={22} />
                    </Button>
                  </div>
                ))}
                {calculationListWeight.length === 0 && (
                  <EmptyListLabel
                    itemName=""
                    customLabel="No Weights Added"
                    className="text-sm text-stone-400"
                  />
                )}
              </ScrollShadow>
            </>
          ) : (
            <>
              <div className="flex px-0.5 text-sm font-medium">
                <span>Distance</span>
                <span className="pl-[12rem]">Multiplier</span>
              </div>
              <ScrollShadow
                className={
                  showNumberInput
                    ? "flex flex-col gap-1.5 h-[244px]"
                    : "flex flex-col gap-1.5 h-[280px]"
                }
              >
                {calculationListDistance.map((distance, index) => (
                  <div
                    key={`calculation-list-distance-${index}`}
                    className="flex gap-1.5 items-center"
                  >
                    <button
                      className="flex w-[13.25rem] justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg"
                      onClick={() =>
                        handleClickCalculationItem(distance, index)
                      }
                    >
                      <span className="w-[7rem] truncate text-left">
                        {distance.label}
                      </span>
                      <div className="flex gap-1 text-secondary">
                        <span className="w-[3.5rem] truncate text-right">
                          {distance.value}
                        </span>
                        <span>{distance.unit}</span>
                      </div>
                    </button>
                    <div className="flex gap-0.5 select-none">
                      <Input
                        aria-label={`${distance.label} Multiplier Input`}
                        className="w-[4rem] order-2"
                        size="sm"
                        variant="faded"
                        value={distance.multiplierInput}
                        isInvalid={distance.isMultiplierInputInvalid}
                        onValueChange={(value) =>
                          handleDistanceMultiplierChange(value, distance, index)
                        }
                        isClearable
                      />
                      <PlusAndMinusButtons
                        trackingValue={"list"}
                        updateValue={incrementMultiplier}
                        isDecreaseDisabled={
                          distance.disableDecreaseMultiplierButton
                        }
                        isIncreaseDisabled={
                          distance.disableIncreaseMultiplierButton
                        }
                        calculationItem={distance}
                        index={index}
                        wrapAround
                      />
                    </div>
                    <Button
                      aria-label={`Remove ${distance.label} From Calculation List`}
                      size="sm"
                      color="danger"
                      isIconOnly
                      variant="light"
                      onPress={() => handleRemoveButton(index)}
                    >
                      <CrossCircleIcon size={22} />
                    </Button>
                  </div>
                ))}
                {calculationListDistance.length === 0 && (
                  <EmptyListLabel
                    itemName=""
                    customLabel="No Distances Added"
                    className="text-sm text-stone-400"
                  />
                )}
              </ScrollShadow>
            </>
          )}
          <div className="grid grid-rows-2 grid-cols-3 h-[3.5rem]">
            <div className="flex items-end font-medium text-lg leading-none">
              Total
            </div>
            <div className="flex items-end font-medium text-lg leading-none justify-self-center">
              Multiplier
            </div>
            <div className="flex items-end font-medium text-lg leading-none justify-self-end">
              Result
            </div>
            <div className="flex gap-1 text-stone-400 font-semibold text-lg pt-0.5">
              <span className="max-w-[4rem] truncate">
                {presetsType === "equipment" ? totalWeight : totalDistance}
              </span>
              <span>
                {presetsType === "equipment" ? weightUnit : distanceUnit}
              </span>
            </div>
            <div className="flex justify-self-center gap-0.5 pt-0.5 select-none">
              <Input
                aria-label={`Total ${presetText} Multiplier Input`}
                className="w-[4rem] order-2"
                size="sm"
                variant="faded"
                value={totalMultiplierInput}
                isInvalid={isTotalMultiplierInvalid}
                onValueChange={setTotalMultiplierInput}
                isClearable
              />
              <PlusAndMinusButtons
                trackingValue="total"
                updateValue={incrementMultiplier}
                isDecreaseDisabled={disableTotalMultiplierDecreaseButton}
                isIncreaseDisabled={disableTotalMultiplierIncreaseButton}
                wrapAround
              />
            </div>
            <div className="flex gap-1 text-secondary font-semibold text-lg pt-0.5 justify-self-end">
              <span className="max-w-[4rem] truncate">
                {presetsType === "equipment" ? resultWeight : resultDistance}
              </span>
              <span>
                {presetsType === "equipment" ? weightUnit : distanceUnit}
              </span>
            </div>
          </div>
        </div>
      ) : weightCalculatorPage === "calc" ? (
        <>
          <Calculator
            isCalculationInvalid={isCalculationInvalid}
            setIsCalculationInvalid={setIsCalculationInvalid}
            buttonAction={addCalculationString}
            operatingCalculationItem={operatingCalculationItem}
          />
        </>
      ) : (
        <PresetsModalList
          presetsList={usePresetsList}
          handlePresetClick={handlePresetClick}
          showExtraMenu
        />
      )}
    </>
  );
};
