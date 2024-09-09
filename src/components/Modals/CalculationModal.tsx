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
  Distance,
  EquipmentWeight,
  UseCalculationModalReturnType,
  UsePresetsListReturnType,
} from "../../typings";
import { FavoriteButton } from "../FavoriteButton";
import { EmptyListLabel, LoadingSpinner, SearchInput } from "..";
import { useMemo, useState } from "react";
import { CrossCircleIcon } from "../../assets";
import {
  ConvertNumberToTwoDecimals,
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

type CalculationItemWeight = {
  isPreset: boolean;
  equipmentWeight: EquipmentWeight;
  multiplierInput: string;
  multiplier: number;
  isMultiplierInputInvalid: boolean;
  customInputString: string;
};

type CalculationItemDistance = {
  isPreset: boolean;
  distance: Distance;
  multiplierInput: string;
  multiplier: number;
  isMultiplierInputInvalid: boolean;
  customInputString: string;
};

export const CalculationModal = ({
  useCalculationModal,
  usePresetsList,
  doneButtonAction,
  weightUnit,
  distanceUnit,
}: CalculationModalProps) => {
  const [calculationListWeight, setCalculationListWeight] = useState<
    CalculationItemWeight[]
  >([]);
  const [calculationListDistance, setCalculationListDistance] = useState<
    CalculationItemDistance[]
  >([]);
  const [isTotalMultiplierInvalid, setIsTotalMultiplierInvalid] =
    useState<boolean>(false);
  const [totalMultiplierInput, setTotalMultiplierInput] = useState<string>("");

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

  const handleGoToListButton = async () => {
    if (presetsType === "equipment" && isLoadingEquipment) {
      await getEquipmentWeights();
    }

    if (presetsType === "distance" && isLoadingDistance) {
      await getDistances();
    }

    setCalculationModalPage("list");
  };

  const handlePresetClick = (
    equipment?: EquipmentWeight,
    distance?: Distance
  ) => {
    if (equipment !== undefined) {
      const calculationItem: CalculationItemWeight = {
        isPreset: true,
        equipmentWeight: equipment,
        multiplierInput: "",
        multiplier: 1,
        isMultiplierInputInvalid: false,
        customInputString: "",
      };

      const updatedCalculationListWeight = [
        ...calculationListWeight,
        calculationItem,
      ];

      setCalculationListWeight(updatedCalculationListWeight);
    }

    if (distance !== undefined) {
      const calculationItem: CalculationItemDistance = {
        isPreset: true,
        distance: distance,
        multiplierInput: "",
        multiplier: 1,
        isMultiplierInputInvalid: false,
        customInputString: "",
      };

      const updatedCalculationListDistance = [
        ...calculationListDistance,
        calculationItem,
      ];

      setCalculationListDistance(updatedCalculationListDistance);
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
  };

  const isListEmpty = useMemo(() => {
    if (presetsType === "equipment") {
      return calculationListWeight.length === 0;
    } else {
      return calculationListDistance.length === 0;
    }
  }, [presetsType, calculationListWeight, calculationListDistance]);

  const presetText = useMemo(() => {
    return presetsType === "equipment" ? "Weight" : "Distance";
  }, [presetsType]);

  const totalWeight = useMemo(() => {
    return calculationListWeight.reduce(
      (total, item) =>
        ConvertNumberToTwoDecimals(
          total + item.equipmentWeight.weight * item.multiplier
        ),
      0
    );
  }, [calculationListWeight]);

  const totalDistance = useMemo(() => {
    return calculationListDistance.reduce(
      (total, item) =>
        ConvertNumberToTwoDecimals(
          total + item.distance.distance * item.multiplier
        ),
      0
    );
  }, [calculationListDistance]);

  const totalMultiplier = useMemo(() => {
    const isInputInvalid = IsStringInvalidNumber(totalMultiplierInput);

    setIsTotalMultiplierInvalid(isInputInvalid);

    const multiplier =
      isInputInvalid || IsStringEmpty(totalMultiplierInput)
        ? 1
        : Number(totalMultiplierInput);

    return multiplier;
  }, [totalMultiplierInput]);

  const resultWeight = useMemo(() => {
    return ConvertNumberToTwoDecimals(totalWeight * totalMultiplier);
  }, [totalWeight, totalMultiplier]);

  const resultDistance = useMemo(() => {
    return ConvertNumberToTwoDecimals(totalDistance * totalMultiplier);
  }, [totalDistance, totalMultiplier]);

  const handleWeightMultiplierChange = (
    value: string,
    weight: CalculationItemWeight,
    index: number
  ) => {
    const isInputInvalid = IsStringInvalidNumber(value);

    const multiplier =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const updatedCalculationItem = {
      ...weight,
      multiplierInput: value,
      multiplier: multiplier,
      isMultiplierInputInvalid: isInputInvalid,
    };

    const updatedCalculationListWeight = [...calculationListWeight];

    updatedCalculationListWeight[index] = updatedCalculationItem;

    setCalculationListWeight(updatedCalculationListWeight);
  };

  const handleDistanceMultiplierChange = (
    value: string,
    distance: CalculationItemDistance,
    index: number
  ) => {
    const isInputInvalid = IsStringInvalidNumber(value);

    const multiplier =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const updatedCalculationItem = {
      ...distance,
      multiplierInput: value,
      multiplier: multiplier,
      isMultiplierInputInvalid: isInputInvalid,
    };

    const updatedCalculationListDistance = [...calculationListDistance];

    updatedCalculationListDistance[index] = updatedCalculationItem;

    setCalculationListDistance(updatedCalculationListDistance);
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
              ) : (
                <>Select {presetText}</>
              )}
            </ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-2">
                {calculationModalPage === "base" ? (
                  <>
                    {presetsType === "equipment" ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex px-0.5 text-sm font-medium">
                          <span>Weight</span>
                          <span className="pl-[14.5rem]">Multiplier</span>
                        </div>
                        <ScrollShadow className="flex flex-col gap-1.5 h-[330px]">
                          {calculationListWeight.map((weight, index) => (
                            <div
                              key={`calculation-list-weight-${index}`}
                              className="flex gap-1.5 items-center"
                            >
                              {weight.isPreset ? (
                                <>
                                  <div className="flex justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
                                    <span className="w-[11rem] truncate">
                                      {weight.equipmentWeight.name}
                                    </span>
                                    <div className="flex gap-1 text-secondary">
                                      <span className="w-[3.5rem] truncate text-right">
                                        {weight.equipmentWeight.weight}
                                      </span>
                                      <span>
                                        {weight.equipmentWeight.weight_unit}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-[4rem]">
                                    <Input
                                      aria-label={`${weight.equipmentWeight.name} Multiplier Input`}
                                      size="sm"
                                      variant="faded"
                                      value={weight.multiplierInput}
                                      isInvalid={
                                        weight.isMultiplierInputInvalid
                                      }
                                      onValueChange={(value) =>
                                        handleWeightMultiplierChange(
                                          value,
                                          weight,
                                          index
                                        )
                                      }
                                      isClearable
                                    />
                                  </div>
                                  <Button
                                    aria-label={`Remove ${weight.equipmentWeight.name} From Calculation List`}
                                    size="sm"
                                    color="danger"
                                    isIconOnly
                                    variant="light"
                                    onPress={() => handleRemoveButton(index)}
                                  >
                                    <CrossCircleIcon size={22} />
                                  </Button>
                                </>
                              ) : (
                                <></>
                              )}
                            </div>
                          ))}
                          {calculationListWeight.length === 0 && (
                            <EmptyListLabel
                              itemName=""
                              customLabel="Add Weight Or Custom Calculation"
                              className="text-sm text-stone-400"
                            />
                          )}
                        </ScrollShadow>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex px-0.5 text-sm font-medium">
                          <span>Distance</span>
                          <span className="pl-[14rem]">Multiplier</span>
                        </div>
                        <ScrollShadow className="flex flex-col gap-1.5 h-[330px]">
                          {calculationListDistance.map((distance, index) => (
                            <div
                              key={`calculation-list-distance-${index}`}
                              className="flex gap-1.5 items-center"
                            >
                              {distance.isPreset ? (
                                <>
                                  <div className="flex justify-between gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
                                    <span className="w-[11rem] truncate">
                                      {distance.distance.name}
                                    </span>
                                    <div className="flex gap-1 text-secondary">
                                      <span className="w-[3.5rem] truncate text-right">
                                        {distance.distance.distance}
                                      </span>
                                      <span>
                                        {distance.distance.distance_unit}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-[4rem]">
                                    <Input
                                      aria-label={`${distance.distance.name} Multiplier Input`}
                                      size="sm"
                                      variant="faded"
                                      value={distance.multiplierInput}
                                      isInvalid={
                                        distance.isMultiplierInputInvalid
                                      }
                                      onValueChange={(value) =>
                                        handleDistanceMultiplierChange(
                                          value,
                                          distance,
                                          index
                                        )
                                      }
                                      isClearable
                                    />
                                  </div>
                                  <Button
                                    aria-label={`Remove ${distance.distance.name} From Calculation List`}
                                    size="sm"
                                    color="danger"
                                    isIconOnly
                                    variant="light"
                                    onPress={() => handleRemoveButton(index)}
                                  >
                                    <CrossCircleIcon size={22} />
                                  </Button>
                                </>
                              ) : (
                                <></>
                              )}
                            </div>
                          ))}
                          {calculationListDistance.length === 0 && (
                            <EmptyListLabel
                              itemName=""
                              customLabel="Add Distance Or Custom Calculation"
                              className="text-sm text-stone-400"
                            />
                          )}
                        </ScrollShadow>
                      </div>
                    )}
                    <div className="grid grid-rows-2 grid-cols-4 h-[3.5rem]">
                      <div className="row-span-2 flex items-end">
                        {!isListEmpty && (
                          <Button
                            variant="flat"
                            size="sm"
                            onPress={handleClearAllButton}
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                      <div className="flex items-end font-medium text-lg leading-none">
                        Total
                      </div>
                      <div className="flex items-end font-medium text-lg leading-none justify-self-center">
                        Multiplier
                      </div>
                      <div className="flex items-end font-semibold text-lg leading-none justify-self-end">
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
                      <div className="justify-self-center">
                        <Input
                          aria-label={`Total ${presetText} Multiplier Input`}
                          className="w-[4rem]"
                          size="sm"
                          variant="faded"
                          value={totalMultiplierInput}
                          isInvalid={isTotalMultiplierInvalid}
                          onValueChange={setTotalMultiplierInput}
                          isClearable
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
              <div className="flex gap-2">
                <Button
                  className="w-28"
                  variant="flat"
                  color="secondary"
                  onPress={
                    calculationModalPage === "base"
                      ? handleGoToListButton
                      : () => setCalculationModalPage("base")
                  }
                >
                  {calculationModalPage === "base"
                    ? `Add ${presetText}`
                    : "Back"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  // TODO: ADD ISDISABLED
                  // isDisabled={}
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
