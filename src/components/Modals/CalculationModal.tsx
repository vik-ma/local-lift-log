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
  input: string;
};

type CalculationItemDistance = {
  isPreset: boolean;
  distance: Distance;
  multiplyInput: string;
  input: string;
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
        input: "",
      };

      const updatedCalculationListWeight = [
        ...calculationListWeight,
        calculationItem,
      ];

      // const updatedCalculationListWeight = [
      //   ...calculationListWeight,
      //   ...[
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //     calculationItem,
      //   ],
      // ];

      setCalculationListWeight(updatedCalculationListWeight);
    }

    if (distance !== undefined) {
      const calculationItem: CalculationItemDistance = {
        isPreset: true,
        distance: distance,
        multiplyInput: "",
        input: "",
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
                  presetsType === "equipment" ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex px-1 gap-1 text-sm justify-between font-medium pr-5">
                        <span>Weight</span>
                        <span>Multiply Factor</span>
                      </div>
                      <ScrollShadow className="flex flex-col gap-1.5 h-[330px]">
                        {calculationListWeight.map((weight, index) => (
                          <div
                            key={`calculation-list-weight-${index}`}
                            className="flex gap-1.5 items-center"
                          >
                            {weight.isPreset ? (
                              <>
                                <div className="flex justify-between w-full gap-1 bg-default-50 px-1.5 py-0.5 border-2 rounded-lg">
                                  <span className="max-w-[11rem] truncate">
                                    {weight.equipmentWeight.name}
                                  </span>
                                  <div className="flex gap-1 text-secondary">
                                    <span className="max-w-[3.5rem] truncate">
                                      {weight.equipmentWeight.weight}
                                    </span>
                                    <span>
                                      {weight.equipmentWeight.weight_unit}
                                    </span>
                                  </div>
                                </div>
                                <Input
                                  className="w-[5.5rem]"
                                  size="sm"
                                  variant="faded"
                                  // TODO: ADD ISINVALID
                                  // isInvalid={}
                                  isClearable
                                />
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
                            <span className="max-w-40 truncate">3333333</span>
                            <span>
                              {presetsType === "equipment"
                                ? weightUnit
                                : distanceUnit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
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
