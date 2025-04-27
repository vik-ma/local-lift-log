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
  EmptyListLabel,
  MeasurementModalList,
  BodyMeasurementsReorderItem,
  WeightUnitDropdown,
} from "..";
import { Reorder } from "framer-motion";
import {
  Measurement,
  UseBodyMeasurementsInputReturnType,
  UseDisclosureReturnType,
  UseMeasurementListReturnType,
} from "../../typings";
import { useMemo, useState } from "react";
import { DeleteItemFromList } from "../../helpers";

type BodyMeasurementsModalProps = {
  bodyMeasurementsModal: UseDisclosureReturnType;
  useBodyMeasurementInputs: UseBodyMeasurementsInputReturnType;
  useMeasurementList: UseMeasurementListReturnType;
  doneButtonAction: () => void;
  isEditing: boolean;
  updateActiveTrackingMeasurementOrder?: (
    newActiveMeasurements?: Measurement[]
  ) => void;
};

type ModalPage = "base" | "measurement-list";

export const BodyMeasurementsModal = ({
  bodyMeasurementsModal,
  useBodyMeasurementInputs,
  useMeasurementList,
  doneButtonAction,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
}: BodyMeasurementsModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const {
    weightInput,
    setWeightInput,
    weightUnit,
    setWeightUnit,
    commentInput,
    setCommentInput,
    bodyFatPercentageInput,
    setBodyFatPercentageInput,
    isWeightInputValid,
    isBodyFatPercentageInputValid,
    areBodyMeasurementsValid,
    invalidMeasurementInputs,
    handleActiveMeasurementInputChange,
    activeMeasurements,
    setActiveMeasurements,
  } = useBodyMeasurementInputs;

  const handleMeasurementClick = (measurement: Measurement) => {
    if (activeMeasurementSet.has(measurement.id.toString())) {
      const updatedMeasurements = DeleteItemFromList(
        activeMeasurements,
        measurement.id
      );
      setActiveMeasurements(updatedMeasurements);
    } else {
      const updatedMeasurements = [
        ...activeMeasurements,
        { ...measurement, input: "" },
      ];
      setActiveMeasurements(updatedMeasurements);
    }
  };

  const handleClearAllButton = () => {
    const updatedMeasurements: Measurement[] = [];

    setActiveMeasurements(updatedMeasurements);
  };

  const header = useMemo(() => {
    if (modalPage === "measurement-list")
      return "Select Body Measurements To Log";

    if (isEditing) return "Edit Body Measurements Entry";

    return "Add Body Measurements Entry";
  }, [modalPage, isEditing]);

  const activeMeasurementSet = useMemo(() => {
    return new Set<string>(activeMeasurements.map((obj) => obj.id.toString()));
  }, [activeMeasurements]);

  return (
    <Modal
      isOpen={bodyMeasurementsModal.isOpen}
      onOpenChange={bodyMeasurementsModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{header}</ModalHeader>
            <ModalBody>
              {modalPage === "measurement-list" ? (
                <MeasurementModalList
                  useMeasurementList={useMeasurementList}
                  handleMeasurementClick={handleMeasurementClick}
                  highlightedMeasurements={activeMeasurementSet}
                />
              ) : (
                <div className="h-[400px]">
                  <ScrollShadow className="flex flex-col gap-1.5 pr-2.5 h-full">
                    <div className="flex gap-1.5 items-center">
                      <Input
                        value={weightInput}
                        label="Weight"
                        size="sm"
                        variant="faded"
                        onValueChange={(value) => setWeightInput(value)}
                        isInvalid={!isWeightInputValid}
                        isClearable
                      />
                      <WeightUnitDropdown
                        value={weightUnit}
                        setState={setWeightUnit}
                        targetType="state"
                        showLabel
                        isSmall
                      />
                    </div>
                    <Input
                      value={bodyFatPercentageInput}
                      label="Body Fat %"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) =>
                        setBodyFatPercentageInput(value)
                      }
                      isInvalid={!isBodyFatPercentageInputValid}
                      isClearable
                    />
                    <Reorder.Group
                      className="flex flex-col gap-1.5 w-full"
                      values={activeMeasurements}
                      onReorder={setActiveMeasurements}
                    >
                      {activeMeasurements.map((measurement, index) => (
                        <BodyMeasurementsReorderItem
                          key={measurement.id}
                          measurement={measurement}
                          index={index}
                          activeMeasurements={activeMeasurements}
                          setActiveMeasurements={setActiveMeasurements}
                          invalidMeasurementInputs={invalidMeasurementInputs}
                          handleActiveMeasurementInputChange={
                            handleActiveMeasurementInputChange
                          }
                          isEditing={isEditing}
                          updateActiveTrackingMeasurementOrder={
                            updateActiveTrackingMeasurementOrder
                          }
                        />
                      ))}
                    </Reorder.Group>
                    {activeMeasurements.length === 0 && (
                      <EmptyListLabel
                        itemName="Active Measurements"
                        customLabel="Add a Body Measurement to log"
                      />
                    )}
                    <Input
                      value={commentInput}
                      label="Comment"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) => setCommentInput(value)}
                      isClearable
                    />
                  </ScrollShadow>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {modalPage === "measurement-list" ? (
                  <>
                    {activeMeasurements.length > 0 && (
                      <Button variant="flat" onPress={handleClearAllButton}>
                        Clear All
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="flat"
                    color="secondary"
                    onPress={() => setModalPage("measurement-list")}
                  >
                    Select Measurements
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="light"
                  onPress={
                    modalPage === "base" ? onClose : () => setModalPage("base")
                  }
                >
                  {modalPage === "base" ? "Close" : "Back"}
                </Button>
                <Button
                  color="primary"
                  onPress={
                    modalPage === "measurement-list"
                      ? () => setModalPage("base")
                      : doneButtonAction
                  }
                  isDisabled={!areBodyMeasurementsValid && modalPage === "base"}
                >
                  {modalPage === "measurement-list"
                    ? "Done"
                    : isEditing
                    ? "Update"
                    : "Save"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
