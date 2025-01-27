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
  UserMeasurementReorderItem,
} from "..";
import { Reorder } from "framer-motion";
import {
  Measurement,
  UseDisclosureReturnType,
  UseMeasurementListReturnType,
  UseMeasurementsInputsReturnType,
} from "../../typings";
import { useMemo, useState } from "react";
import { DeleteItemFromList } from "../../helpers";

type UserMeasurementModalProps = {
  userMeasurementModal: UseDisclosureReturnType;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  measurementsCommentInput: string;
  setMeasurementsCommentInput: React.Dispatch<React.SetStateAction<string>>;
  useMeasurementsInputs: UseMeasurementsInputsReturnType;
  useMeasurementList: UseMeasurementListReturnType;
  buttonAction: () => void;
  isEditing: boolean;
  updateActiveTrackingMeasurementOrder?: (
    newActiveMeasurements?: Measurement[]
  ) => void;
};

type ModalPage = "base" | "measurement-list";

export const UserMeasurementModal = ({
  userMeasurementModal,
  activeMeasurements,
  setActiveMeasurements,
  measurementsCommentInput,
  setMeasurementsCommentInput,
  useMeasurementsInputs,
  useMeasurementList,
  buttonAction,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
}: UserMeasurementModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");

  const {
    invalidMeasurementInputs,
    areActiveMeasurementsValid,
    handleActiveMeasurementInputChange,
  } = useMeasurementsInputs;

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
    if (modalPage === "base") {
      if (isEditing) return "Edit User Measurements Entry";
      else return "Add User Measurements Entry";
    } else {
      return "Select Body Measurements To Log";
    }
  }, [modalPage, isEditing]);

  const activeMeasurementSet = useMemo(() => {
    return new Set<string>(activeMeasurements.map((obj) => obj.id.toString()));
  }, [activeMeasurements]);

  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
      // TODO: REMOVE WHEN BUG IS FIXED
      disableAnimation
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
                    <Reorder.Group
                      className="flex flex-col gap-1.5 w-full"
                      values={activeMeasurements}
                      onReorder={setActiveMeasurements}
                    >
                      {activeMeasurements.map((measurement, index) => (
                        <UserMeasurementReorderItem
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
                      value={measurementsCommentInput}
                      label="Comment"
                      size="sm"
                      variant="faded"
                      onValueChange={(value) =>
                        setMeasurementsCommentInput(value)
                      }
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
                      : buttonAction
                  }
                  isDisabled={
                    !areActiveMeasurementsValid && modalPage === "base"
                  }
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
