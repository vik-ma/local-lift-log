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

type PresetsListModalProps = {
  presetsListModal: UseDisclosureReturnType;
  equipmentWeights: EquipmentWeight[];
  distances: Distance[];
  presetsType: PresetsType;
  onClickAction: () => void;
};

export const PresetsListModal = ({
  presetsListModal,
  equipmentWeights,
  distances,
  presetsType,
  onClickAction,
}: PresetsListModalProps) => {
  return (
    <Modal
      isOpen={presetsListModal.isOpen}
      onOpenChange={presetsListModal.onOpenChange}
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
                          className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          key={`equipment-${equipment.id}`}
                        >
                          <div className="flex flex-col justify-start items-start">
                            <span className="w-[21.5rem] truncate text-left">
                              {equipment.name}
                            </span>
                            <span className="text-xs text-secondary text-left">
                              {equipment.weight} {equipment.weight_unit}
                            </span>
                          </div>
                        </div>
                      ))
                    : distances.map((distance) => (
                        <div
                          className="flex flex-row justify-between items-center gap-1 bg-default-100 border-2 border-default-200 rounded-xl px-2 py-1 hover:border-default-400 focus:bg-default-200 focus:border-default-400"
                          key={`distance-${distance.id}`}
                        >
                          <div className="flex flex-col justify-start items-start">
                            <span className="w-[21.5rem] truncate text-left">
                              {distance.name}
                            </span>
                            <span className="text-xs text-secondary text-left">
                              {distance.distance} {distance.distance_unit}
                            </span>
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
