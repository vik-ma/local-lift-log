import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
  Input,
} from "@nextui-org/react";
import {
  CalculationListItem,
  Distance,
  EquipmentWeight,
  UseCalculationModalReturnType,
  UsePresetsListReturnType,
} from "../../typings";
import { FavoriteButton } from "../FavoriteButton";
import {
  Calculator,
  EmptyListLabel,
  LoadingSpinner,
  PlusAndMinusButtons,
  SearchInput,
} from "..";
import { useMemo, useState } from "react";
import { CrossCircleIcon } from "../../assets";
import {
  ConvertInputStringToNumber,
  ConvertNumberToTwoDecimals,
  IsCalculationStringValid,
  IsStringEmpty,
  IsStringInvalidNumber,
} from "../../helpers";

type CalculationModalProps = {
  useCalculationModal: UseCalculationModalReturnType;
  usePresetsList: UsePresetsListReturnType;
  doneButtonAction: () => void;
  weightUnit: string;
  distanceUnit: string;
};

export const CalculationModal = ({
  useCalculationModal,
  usePresetsList,
  doneButtonAction,
  weightUnit,
  distanceUnit,
}: CalculationModalProps) => {
  const [calculationListWeight, setCalculationListWeight] = useState<
    CalculationListItem[]
  >([]);
  const [calculationListDistance, setCalculationListDistance] = useState<
    CalculationListItem[]
  >([]);
  const [isTotalMultiplierInvalid, setIsTotalMultiplierInvalid] =
    useState<boolean>(false);
  const [totalMultiplierInput, setTotalMultiplierInput] = useState<string>("");
  const [isCalculationInvalid, setIsCalculationInvalid] =
    useState<boolean>(true);
  const [showNumberInput, setShowNumberInput] = useState<boolean>(false);
  const [numberInput, setNumberInput] = useState<string>("");

  const isNumberInputInvalid = useMemo(() => {
    return IsStringEmpty(numberInput) || IsStringInvalidNumber(numberInput);
  }, [numberInput]);

  const {
    equipmentWeights,
    distances,
    getEquipmentWeights,
    getDistances,
    presetsType,
    toggleFavoriteEquipmentWeight,
    toggleFavoriteDistance,
    filterQueryEquipment,
    setFilterQueryEquipment,
    filterQueryDistance,
    setFilterQueryDistance,
    filteredEquipmentWeights,
    filteredDistances,
    isLoadingEquipment,
    isLoadingDistance,
  } = usePresetsList;

  const { calculationModal, calculationModalPage, setCalculationModalPage } =
    useCalculationModal;

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

  const handleGoToListButton = async () => {
    if (presetsType === "equipment" && isLoadingEquipment) {
      await getEquipmentWeights();
    }

    if (presetsType === "distance" && isLoadingDistance) {
      await getDistances();
    }

    setCalculationModalPage("list");
    setShowNumberInput(false);
  };

  const handleGoToCalculationButton = () => {
    setCalculationModalPage("calc");
    setShowNumberInput(false);
  };

  const handlePresetClick = (
    equipment?: EquipmentWeight,
    distance?: Distance
  ) => {
    if (equipment !== undefined) {
      const calculationItem: CalculationListItem = {
        itemType: "preset",
        label: equipment.name,
        value: equipment.weight,
        unit: equipment.weight_unit,
        multiplierInput: "",
        multiplier: 1,
        isMultiplierInputInvalid: false,
        disableDecreaseMultiplierButton: true,
        equipmentWeight: equipment,
      };

      addItemToCalculationList(calculationItem);
    }

    if (distance !== undefined) {
      const calculationItem: CalculationListItem = {
        itemType: "preset",
        label: distance.name,
        value: distance.distance,
        unit: distance.distance_unit,
        multiplierInput: "",
        multiplier: 1,
        isMultiplierInputInvalid: false,
        disableDecreaseMultiplierButton: true,
        distance: distance,
      };

      addItemToCalculationList(calculationItem);
    }

    setCalculationModalPage("base");
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

  const { totalMultiplier, disableTotalMultiplierDecreaseButton } =
    useMemo(() => {
      const isInputInvalid =
        IsStringInvalidNumber(totalMultiplierInput) ||
        totalMultiplierInput === "0";

      setIsTotalMultiplierInvalid(isInputInvalid);

      const multiplier =
        isInputInvalid || IsStringEmpty(totalMultiplierInput)
          ? 1
          : Number(totalMultiplierInput);

      const disableButton =
        isInputInvalid || Number(totalMultiplierInput) - 1 <= 0;

      return {
        totalMultiplier: multiplier,
        disableTotalMultiplierDecreaseButton: disableButton,
      };
    }, [totalMultiplierInput]);

  const resultWeight = useMemo(() => {
    return ConvertNumberToTwoDecimals(totalWeight * totalMultiplier);
  }, [totalWeight, totalMultiplier]);

  const resultDistance = useMemo(() => {
    return ConvertNumberToTwoDecimals(totalDistance * totalMultiplier);
  }, [totalDistance, totalMultiplier]);

  const handleWeightMultiplierChange = (
    value: string,
    weight: CalculationListItem,
    index: number
  ) => {
    const isInputInvalid = IsStringInvalidNumber(value) || value === "0";

    const multiplier =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const disableButton = isInputInvalid || multiplier - 1 <= 0;

    const updatedCalculationItem = {
      ...weight,
      multiplierInput: value,
      multiplier: multiplier,
      isMultiplierInputInvalid: isInputInvalid,
      disableDecreaseMultiplierButton: disableButton,
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
    const isInputInvalid = IsStringInvalidNumber(value) || value === "0";

    const multiplier =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const disableButton = isInputInvalid || multiplier - 1 <= 0;

    const updatedCalculationItem = {
      ...distance,
      multiplierInput: value,
      multiplier: multiplier,
      isMultiplierInputInvalid: isInputInvalid,
      disableDecreaseMultiplierButton: disableButton,
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

        const newValue = parseFloat((totalInputNum + modifier).toFixed(2));

        const updatedInput = newValue === 1 ? "" : newValue.toString();
        setTotalMultiplierInput(updatedInput);

        break;
      }
      case "list": {
        if (calculationItem === undefined || index === undefined) return;

        const inputNum = IsStringEmpty(calculationItem.multiplierInput)
          ? 1
          : ConvertInputStringToNumber(calculationItem.multiplierInput);

        const newValue = parseFloat((inputNum + modifier).toFixed(2));

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

    const calculationItem: CalculationListItem = {
      itemType: "calculation",
      label: calculationString,
      value: result,
      unit: presetsType === "equipment" ? weightUnit : distanceUnit,
      multiplierInput: "",
      multiplier: 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: true,
    };

    addItemToCalculationList(calculationItem);

    setCalculationModalPage("base");
  };

  const handleAddNumberButton = () => {
    if (isNumberInputInvalid) return;

    const unit = presetsType === "equipment" ? weightUnit : distanceUnit;

    const calculationItem: CalculationListItem = {
      itemType: "number",
      label: `${numberInput} ${unit}`,
      value: ConvertNumberToTwoDecimals(Number(numberInput)),
      unit: unit,
      multiplierInput: "",
      multiplier: 1,
      isMultiplierInputInvalid: false,
      disableDecreaseMultiplierButton: true,
    };

    addItemToCalculationList(calculationItem);

    setNumberInput("");
    setShowNumberInput(false);
  };

  return (
    <Modal
      isOpen={calculationModal.isOpen}
      onOpenChange={calculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {calculationModalPage === "base" ? (
                <>Calculate {presetText}</>
              ) : calculationModalPage === "list" ? (
                <>Select {presetText}</>
              ) : (
                <>Calculation</>
              )}
            </ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-2">
                {calculationModalPage === "base" ? (
                  <>
                    {presetsType === "equipment" ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between pb-1">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={handleGoToListButton}
                            >
                              Add Preset
                            </Button>
                            <Button
                              color={showNumberInput ? "secondary" : "default"}
                              size="sm"
                              variant="flat"
                              onPress={() =>
                                setShowNumberInput(!showNumberInput)
                              }
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
                          <div className="flex gap-1 pb-0.5 items-center justify-between">
                            <div className="flex gap-2 items-center">
                              <span className="text-sm font-medium text-stone-500">
                                New {presetText}
                              </span>
                              <Input
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
                                onPress={handleAddNumberButton}
                              >
                                Add {presetText}
                              </Button>
                            </div>
                            <div>
                              <Button
                                variant="flat"
                                size="sm"
                                onPress={() => setShowNumberInput(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex px-0.5 text-sm font-medium">
                          <span>Weight</span>
                          <span className="pl-[12.75rem]">Multiplier</span>
                        </div>
                        <ScrollShadow
                          className={
                            showNumberInput
                              ? "flex flex-col gap-1.5 h-[242px]"
                              : "flex flex-col gap-1.5 h-[280px]"
                          }
                        >
                          {calculationListWeight.map((weight, index) => (
                            <div
                              key={`calculation-list-weight-${index}`}
                              className="flex gap-1.5 items-center"
                            >
                              <div className="flex justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
                                <span className="w-[7rem] truncate">
                                  {weight.label}
                                </span>
                                <div className="flex gap-1 text-secondary">
                                  <span className="w-[3.5rem] truncate text-right">
                                    {weight.value}
                                  </span>
                                  <span>{weight.unit}</span>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                <Input
                                  aria-label={`${weight.label} Multiplier Input`}
                                  className="w-[4rem] order-2"
                                  size="sm"
                                  variant="faded"
                                  value={weight.multiplierInput}
                                  isInvalid={weight.isMultiplierInputInvalid}
                                  onValueChange={(value) =>
                                    handleWeightMultiplierChange(
                                      value,
                                      weight,
                                      index
                                    )
                                  }
                                  isClearable
                                />
                                <PlusAndMinusButtons
                                  trackingValue={"list"}
                                  updateValue={incrementMultiplier}
                                  isDecreaseDisabled={
                                    weight.disableDecreaseMultiplierButton
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
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex px-0.5 text-sm font-medium">
                          <span>Distance</span>
                          <span className="pl-[12rem]">Multiplier</span>
                        </div>
                        <ScrollShadow className="flex flex-col gap-1.5 h-[325px]">
                          {calculationListDistance.map((distance, index) => (
                            <div
                              key={`calculation-list-distance-${index}`}
                              className="flex gap-1.5 items-center"
                            >
                              <div className="flex justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
                                <span className="w-[7rem] truncate">
                                  {distance.label}
                                </span>
                                <div className="flex gap-1 text-secondary">
                                  <span className="w-[3.5rem] truncate text-right">
                                    {distance.value}
                                  </span>
                                  <span>{distance.unit}</span>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                <Input
                                  aria-label={`${distance.label} Multiplier Input`}
                                  className="w-[4rem] order-2"
                                  size="sm"
                                  variant="faded"
                                  value={distance.multiplierInput}
                                  isInvalid={distance.isMultiplierInputInvalid}
                                  onValueChange={(value) =>
                                    handleDistanceMultiplierChange(
                                      value,
                                      distance,
                                      index
                                    )
                                  }
                                  isClearable
                                />
                                <PlusAndMinusButtons
                                  trackingValue={"list"}
                                  updateValue={incrementMultiplier}
                                  isDecreaseDisabled={
                                    distance.disableDecreaseMultiplierButton
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
                      </div>
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
                          {presetsType === "equipment"
                            ? totalWeight
                            : totalDistance}
                        </span>
                        <span>
                          {presetsType === "equipment"
                            ? weightUnit
                            : distanceUnit}
                        </span>
                      </div>
                      <div className="flex justify-self-center gap-0.5 pt-0.5">
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
                          isDecreaseDisabled={
                            disableTotalMultiplierDecreaseButton
                          }
                          wrapAround
                        />
                      </div>
                      <div className="flex gap-1 text-secondary font-semibold text-lg pt-0.5 justify-self-end">
                        <span className="max-w-[4rem] truncate">
                          {presetsType === "equipment"
                            ? resultWeight
                            : resultDistance}
                        </span>
                        <span>
                          {presetsType === "equipment"
                            ? weightUnit
                            : distanceUnit}
                        </span>
                      </div>
                    </div>
                  </>
                ) : calculationModalPage === "calc" ? (
                  <>
                    <Calculator
                      isCalculationInvalid={isCalculationInvalid}
                      setIsCalculationInvalid={setIsCalculationInvalid}
                      buttonAction={addCalculationString}
                    />
                  </>
                ) : (
                  <>
                    <SearchInput
                      filterQuery={
                        presetsType === "equipment"
                          ? filterQueryEquipment
                          : filterQueryDistance
                      }
                      setFilterQuery={
                        presetsType === "equipment"
                          ? setFilterQueryEquipment
                          : setFilterQueryDistance
                      }
                      filteredListLength={
                        presetsType === "equipment"
                          ? filteredEquipmentWeights.length
                          : filteredDistances.length
                      }
                      totalListLength={
                        presetsType === "equipment"
                          ? equipmentWeights.length
                          : distances.length
                      }
                    />
                    <ScrollShadow className="flex flex-col gap-1 w-full">
                      {presetsType === "equipment" ? (
                        isLoadingEquipment ? (
                          <LoadingSpinner />
                        ) : (
                          <>
                            {filteredEquipmentWeights.map((equipment) => (
                              <div
                                className="flex flex-row justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                                key={`equipment-${equipment.id}`}
                                onClick={() =>
                                  handlePresetClick(equipment, undefined)
                                }
                              >
                                <div className="flex flex-col justify-start items-start pl-2 py-1">
                                  <span className="w-[20.5rem] truncate text-left">
                                    {equipment.name}
                                  </span>
                                  <span className="text-xs text-secondary text-left">
                                    {equipment.weight} {equipment.weight_unit}
                                  </span>
                                </div>
                                <div className="flex items-center pr-2">
                                  <FavoriteButton
                                    name={equipment.name}
                                    isFavorite={!!equipment.is_favorite}
                                    item={equipment}
                                    toggleFavorite={
                                      toggleFavoriteEquipmentWeight
                                    }
                                  />
                                </div>
                              </div>
                            ))}
                            {filteredEquipmentWeights.length === 0 && (
                              <EmptyListLabel itemName="Equipment Weights" />
                            )}
                          </>
                        )
                      ) : isLoadingDistance ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          {filteredDistances.map((distance) => (
                            <div
                              className="flex flex-row justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                              key={`distance-${distance.id}`}
                              onClick={() =>
                                handlePresetClick(undefined, distance)
                              }
                            >
                              <div className="flex flex-col justify-start items-start pl-2 py-1">
                                <span className="w-[20.5rem] truncate text-left">
                                  {distance.name}
                                </span>
                                <span className="text-xs text-secondary text-left">
                                  {distance.distance} {distance.distance_unit}
                                </span>
                              </div>
                              <div className="flex items-center pr-2">
                                <FavoriteButton
                                  name={distance.name}
                                  isFavorite={!!distance.is_favorite}
                                  item={distance}
                                  toggleFavorite={toggleFavoriteDistance}
                                />
                              </div>
                            </div>
                          ))}
                          {filteredDistances.length === 0 && (
                            <EmptyListLabel itemName="Distances" />
                          )}
                        </>
                      )}
                    </ScrollShadow>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-1">
                {calculationModalPage !== "base" && (
                  <Button
                    variant="flat"
                    onPress={() => setCalculationModalPage("base")}
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    (presetsType === "equipment" && resultWeight === 0) ||
                    (presetsType === "distance" && resultDistance === 0)
                  }
                  onPress={doneButtonAction}
                >
                  Done
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
