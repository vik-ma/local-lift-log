import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ScrollShadow,
} from "@nextui-org/react";
import {
  Distance,
  EquipmentWeight,
  PresetsType,
  UseCalculationModalReturnType,
  UsePresetsListReturnType,
} from "../../typings";
import { FavoriteButton } from "../FavoriteButton";
import { EmptyListLabel, LoadingSpinner, SearchInput } from "..";

type CalculationModalProps = {
  useCalculationModal: UseCalculationModalReturnType;
  onClickAction: (
    presetsType: PresetsType,
    equipment?: EquipmentWeight,
    distance?: Distance
  ) => void;
  usePresetsList: UsePresetsListReturnType;
};

export const CalculationModal = ({
  useCalculationModal,
  onClickAction,
  usePresetsList,
}: CalculationModalProps) => {
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
                <>
                  Calculate{" "}
                  {presetsType === "equipment" ? "Weight" : "Distance"}
                </>
              ) : (
                <>
                  Select{" "}
                  {presetsType === "equipment"
                    ? "Equipment Weight"
                    : "Distance"}
                </>
              )}
            </ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-2">
                {calculationModalPage === "base" ? (
                  <></>
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
                                  onClickAction("equipment", equipment)
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
                                onClickAction("equipment", undefined, distance)
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
                  variant="flat"
                  color="secondary"
                  onPress={
                    calculationModalPage === "base"
                      ? handleGoToListButton
                      : () => setCalculationModalPage("base")
                  }
                >
                  {calculationModalPage === "base" ? "Add Preset" : "Back"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
