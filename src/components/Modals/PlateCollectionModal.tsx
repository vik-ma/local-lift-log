import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
} from "@heroui/react";
import {
  EquipmentWeight,
  PlateCollection,
  UsePlateCollectionModalReturnType,
  UsePresetsListReturnType,
} from "../../typings";
import { useValidateName } from "../../hooks";
import { useEffect, useMemo, useState } from "react";
import {
  AvailablePlatesDropdown,
  PlateCollectionHandleConfig,
  PresetsModalList,
  WeightUnitDropdown,
} from "..";
import { CrossCircleIcon } from "../../assets";
import { UpdateAvailablePlatesInPlateCollection } from "../../helpers";

type PlateCollectionModalProps = {
  usePlateCollectionModal: UsePlateCollectionModalReturnType;
  plateCollection: PlateCollection;
  setPlateCollection: React.Dispatch<React.SetStateAction<PlateCollection>>;
  usePresetsList: UsePresetsListReturnType;
  buttonAction: (plateCollection: PlateCollection) => void;
};

type OperationType = "set-handle" | "set-plates";

export const PlateCollectionModal = ({
  usePlateCollectionModal,
  plateCollection,
  setPlateCollection,
  usePresetsList,
  buttonAction,
}: PlateCollectionModalProps) => {
  const [operationType, setOperationType] =
    useState<OperationType>("set-handle");
  const [nameInput, setNameInput] = useState<string>("");

  const isNameInputValid = useValidateName({ name: nameInput });

  const {
    otherUnitPlateCollection,
    setOtherUnitPlateCollection,
    updateAvailablePlatesMapKeys,
  } = usePresetsList;

  const { plateCollectionModal, plateCalculatorPage, setPlateCalculatorPage } =
    usePlateCollectionModal;

  const handleSetHandleButton = () => {
    setOperationType("set-handle");
    setPlateCalculatorPage("equipment-list");
  };

  const handleSetAvailablePlatesButton = () => {
    setOperationType("set-plates");
    setPlateCalculatorPage("equipment-list");
  };

  const handleBackButton = () => {
    setOperationType("set-handle");
    setPlateCalculatorPage("base");
  };

  const setHandle = (equipment?: EquipmentWeight) => {
    if (equipment === undefined) return;

    const updatedPlateCollection: PlateCollection = {
      ...plateCollection,
      handle_id: equipment.id,
      handle: equipment,
    };

    setPlateCollection(updatedPlateCollection);

    setPlateCalculatorPage("base");
    setOperationType("set-handle");
  };

  const switchWeightUnit = () => {
    setOtherUnitPlateCollection(plateCollection);
    setPlateCollection(otherUnitPlateCollection);
  };

  const removePlate = (equipmentWeight: EquipmentWeight) => {
    if (plateCollection.availablePlatesMap === undefined) return;

    const updatedAvailablePlatesMap = new Map(
      plateCollection.availablePlatesMap
    );

    updatedAvailablePlatesMap.delete(equipmentWeight);

    const updatedPlateCollection = UpdateAvailablePlatesInPlateCollection(
      plateCollection,
      updatedAvailablePlatesMap
    );

    setPlateCollection(updatedPlateCollection);
  };

  const disableDoneButton = useMemo(() => {
    if (!isNameInputValid) return true;
    if (plateCalculatorPage === "equipment-list") return true;
    if (plateCollection.handle === undefined) return true;
    if (plateCollection.availablePlatesMap === undefined) return true;
    if (plateCollection.availablePlatesMap.size === 0) return true;
    return false;
  }, [isNameInputValid, plateCollection, plateCalculatorPage]);

  const handleSaveButton = () => {
    if (disableDoneButton) return;

    const updatedPlateCollection = { ...plateCollection, name: nameInput };

    buttonAction(updatedPlateCollection);

    resetInputs();
  };

  const resetInputs = () => {
    setNameInput("");
  };

  useEffect(() => {
    setNameInput(plateCollection.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plateCollection.id]);

  return (
    <Modal
      isOpen={plateCollectionModal.isOpen}
      onOpenChange={plateCollectionModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {plateCalculatorPage === "equipment-list"
                ? "Select Available Plates"
                : plateCollection.id === 0
                ? "New Plate Collection"
                : "Edit Plate Collection"}
            </ModalHeader>
            <ModalBody>
              <div className="h-[440px]">
                {plateCalculatorPage === "base" ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex gap-2.5 items-start">
                      <Input
                        className="h-[5rem]"
                        value={nameInput}
                        isInvalid={!isNameInputValid}
                        label="Name"
                        errorMessage={
                          !isNameInputValid && "Name can't be empty"
                        }
                        variant="faded"
                        onValueChange={setNameInput}
                        isRequired
                        isClearable
                      />
                      <WeightUnitDropdown
                        value={plateCollection.weight_unit}
                        targetType="plate-collection"
                        setPlateCollection={setPlateCollection}
                        showLabel
                        switchWeightUnit={switchWeightUnit}
                      />
                    </div>
                    <PlateCollectionHandleConfig
                      plateCollection={plateCollection}
                      setPlateCollection={setPlateCollection}
                      handleSetHandleButton={handleSetHandleButton}
                    />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-end">
                        <h3 className="text-lg font-medium pl-0.5">
                          Available Plates
                        </h3>
                        {plateCollection.availablePlatesMap!.size > 0 && (
                          <span className="text-sm text-stone-500 pr-7">
                            Number Of Plates
                          </span>
                        )}
                      </div>
                      <ScrollShadow className="flex flex-col gap-1 h-[250px]">
                        {Array.from(
                          plateCollection.availablePlatesMap!.entries()
                        ).map(([key, value]) => (
                          <div
                            key={`plate-${key.id}`}
                            className="flex gap-1.5 items-center"
                          >
                            <div className="flex pl-1.5 py-0.5 bg-default-50 border-2 border-default-200 rounded-lg hover:border-default-400 focus:bg-default-200 focus:border-default-400">
                              <div className="flex gap-1 w-[16.5rem]">
                                <span className="truncate max-w-[5rem]">
                                  {key.weight}
                                </span>
                                <span>{key.weight_unit}</span>
                              </div>
                            </div>
                            <AvailablePlatesDropdown
                              value={value}
                              equipmentWeight={key}
                              operatingPlateCollection={plateCollection}
                              setOperatingPlateCollection={setPlateCollection}
                              isSmall
                            />
                            <Button
                              aria-label={`Remove ${key.name} From Available Plates`}
                              size="sm"
                              color="danger"
                              isIconOnly
                              variant="light"
                              onPress={() => removePlate(key)}
                            >
                              <CrossCircleIcon size={22} />
                            </Button>
                          </div>
                        ))}
                        {plateCollection.availablePlatesMap?.size === 0 && (
                          <span className="px-0.5 text-danger">
                            No Plates Selected
                          </span>
                        )}
                      </ScrollShadow>
                    </div>
                  </div>
                ) : (
                  <PresetsModalList
                    presetsList={usePresetsList}
                    handlePresetClick={
                      operationType === "set-handle"
                        ? setHandle
                        : updateAvailablePlatesMapKeys
                    }
                    heightString="h-[450px]"
                    validWeightUnit={plateCollection.weight_unit}
                    hideToggleInvalidWeightUnitButton
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex gap-2">
                {plateCalculatorPage === "base" && (
                  <Button
                    color="secondary"
                    variant="flat"
                    onPress={handleSetAvailablePlatesButton}
                  >
                    Set Available Plates
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    plateCalculatorPage !== "base" ? handleBackButton : onClose
                  }
                >
                  {plateCalculatorPage !== "base" ? "Back" : "Close"}
                </Button>
                {plateCalculatorPage === "base" && (
                  <Button
                    color="primary"
                    onPress={handleSaveButton}
                    isDisabled={disableDoneButton}
                  >
                    {plateCollection.id !== 0 ? "Save" : "Create"}
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
