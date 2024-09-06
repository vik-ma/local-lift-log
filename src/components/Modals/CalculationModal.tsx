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
  UseDisclosureReturnType,
} from "../../typings";
import { FavoriteButton } from "../FavoriteButton";

type CalculationModalProps = {
  calculationModal: UseDisclosureReturnType;
  equipmentWeights: EquipmentWeight[];
  distances: Distance[];
  presetsType: PresetsType;
  onClickAction: (
    presetsType: PresetsType,
    equipment?: EquipmentWeight,
    distance?: Distance
  ) => void;
  toggleFavoriteEquipmentWeight: (equipmentWeight: EquipmentWeight) => void;
  toggleFavoriteDistance: (distance: Distance) => void;
};

export const CalculationModal = ({
  calculationModal,
  equipmentWeights,
  distances,
  presetsType,
  onClickAction,
  toggleFavoriteEquipmentWeight,
  toggleFavoriteDistance,
}: CalculationModalProps) => {
  return (
    <Modal
      isOpen={calculationModal.isOpen}
      onOpenChange={calculationModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Select{" "}
              {presetsType === "equipment" ? "Equipment Weight" : "Distance"}
            </ModalHeader>
            <ModalBody>
              <div className="h-[400px] flex flex-col gap-2">
                <ScrollShadow className="flex flex-col gap-1 w-full">
                  {presetsType === "equipment"
                    ? equipmentWeights.map((equipment) => (
                        <div
                          className="flex flex-row justify-between items-center gap-1 cursor-pointer bg-default-100 border-2 border-default-200 rounded-xl hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          key={`equipment-${equipment.id}`}
                          onClick={() => onClickAction("equipment", equipment)}
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
                              toggleFavorite={toggleFavoriteEquipmentWeight}
                            />
                          </div>
                        </div>
                      ))
                    : distances.map((distance) => (
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
                </ScrollShadow>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
