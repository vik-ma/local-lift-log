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
  multiplyInput: string;
  multiplyFactor: number;
  isMultiplyInputInvalid: boolean;
  customInputString: string;
};

type CalculationItemDistance = {
  isPreset: boolean;
  distance: Distance;
  multiplyInput: string;
  multiplyFactor: number;
  isMultiplyInputInvalid: boolean;
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
        multiplyInput: "",
        multiplyFactor: 1,
        isMultiplyInputInvalid: false,
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
        multiplyInput: "",
        multiplyFactor: 1,
        isMultiplyInputInvalid: false,
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
          total + item.equipmentWeight.weight * item.multiplyFactor
        ),
      0
    );
  }, [calculationListWeight]);

  const totalDistance = useMemo(() => {
    return calculationListDistance.reduce(
      (total, item) =>
        ConvertNumberToTwoDecimals(
          total + item.distance.distance * item.multiplyFactor
        ),
      0
    );
  }, [calculationListDistance]);

  const handleWeightMultiplyFactorChange = (
    value: string,
    weight: CalculationItemWeight,
    index: number
  ) => {
    const isInputInvalid = IsStringInvalidNumber(value);

    const multiplyFactor =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const updatedCalculationItem = {
      ...weight,
      multiplyInput: value,
      multiplyFactor: multiplyFactor,
      isMultiplyInputInvalid: isInputInvalid,
    };

    const updatedCalculationListWeight = [...calculationListWeight];

    updatedCalculationListWeight[index] = updatedCalculationItem;

    setCalculationListWeight(updatedCalculationListWeight);
  };

  const handleDistanceMultiplyFactorChange = (
    value: string,
    distance: CalculationItemDistance,
    index: number
  ) => {
    const isInputInvalid = IsStringInvalidNumber(value);

    const multiplyFactor =
      isInputInvalid || IsStringEmpty(value) ? 1 : Number(value);

    const updatedCalculationItem = {
      ...distance,
      multiplyInput: value,
      multiplyFactor: multiplyFactor,
      isMultiplyInputInvalid: isInputInvalid,
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
              <div className="h-[400px] flex flex-col gap-2 items-center">
                {calculationModalPage === "base" ? (
                  presetsType === "equipment" ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex px-1 text-sm font-medium">
                        <span>Weight</span>
                        <span className="pl-[13.25rem]">Multiply Factor</span>
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
                                    size="sm"
                                    variant="faded"
                                    value={weight.multiplyInput}
                                    isInvalid={weight.isMultiplyInputInvalid}
                                    onValueChange={(value) =>
                                      handleWeightMultiplyFactorChange(
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
                      </ScrollShadow>
                      <div className="flex justify-between items-end">
                        <div>
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
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-lg">Total</span>
                          <div className="flex gap-1 text-secondary font-semibold text-xl">
                            <span className="max-w-40 truncate">
                              {totalWeight}
                            </span>
                            <span>{weightUnit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex px-1 text-sm font-medium">
                        <span>Distance</span>
                        <span className="pl-[12.75rem]">Multiply Factor</span>
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
                                    size="sm"
                                    variant="faded"
                                    value={distance.multiplyInput}
                                    isInvalid={distance.isMultiplyInputInvalid}
                                    onValueChange={(value) =>
                                      handleDistanceMultiplyFactorChange(
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
                      </ScrollShadow>
                      <div className="grid grid-rows-2 grid-cols-4 gap-y-0.5">
                        <div className="flex items-end col-start-2 font-medium text-lg leading-none">
                          List Total
                        </div>
                        <div className="flex items-end font-medium text-sm leading-none">
                          Multiply Factor
                        </div>
                        <div className="flex items-end font-semibold text-xl leading-none justify-self-end">
                          Result
                        </div>
                        <div className="bg-red-100">
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
                        <div className="flex gap-1 text-stone-400 font-semibold text-lg bg-blue-100">
                          <span className="max-w-[4rem] truncate">
                            {/* {totalDistance} */}
                            333.33
                          </span>
                          <span>{distanceUnit}</span>
                        </div>
                        <div className="justify-self-center bg-red-100">
                          <Input
                            className="w-[4rem]"
                            size="sm"
                            variant="faded"
                            // value={}
                            // isInvalid={}
                            // onValueChange={}
                            isClearable
                          />
                        </div>
                        <div className="flex gap-1 text-secondary font-semibold text-lg text-right bg-blue-100">
                          <span className="max-w-[4rem] truncate">
                            {/* {totalDistance} */}333.33
                          </span>
                          <span>{distanceUnit}</span>
                        </div>
                      </div>
                    </div>
                  )
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
