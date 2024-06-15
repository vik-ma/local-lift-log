import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { UserMeasurementReorderItem } from "..";
import { Reorder } from "framer-motion";
import { Measurement, MeasurementMap } from "../../typings";
import { useState } from "react";

type UserMeasurementModalProps = {
  userMeasurementModal: ReturnType<typeof useDisclosure>;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  measurementsCommentInput: string;
  setMeasurementsCommentInput: React.Dispatch<React.SetStateAction<string>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  areActiveMeasurementsValid: boolean;
  measurementMap: MeasurementMap;
  buttonAction: () => void;
  isEditing: boolean;
  updateActiveTrackingMeasurementOrder?: () => void;
};

export const UserMeasurementModal = ({
  userMeasurementModal,
  activeMeasurements,
  setActiveMeasurements,
  measurementsCommentInput,
  setMeasurementsCommentInput,
  invalidMeasurementInputs,
  handleActiveMeasurementInputChange,
  areActiveMeasurementsValid,
  measurementMap,
  buttonAction,
  isEditing,
  updateActiveTrackingMeasurementOrder = () => {},
}: UserMeasurementModalProps) => {
  const [showMeasurementList, setShowMeasurementList] =
    useState<boolean>(false);
  const [filteredMeasurements, setFilteredMeasurements] =
    useState<MeasurementMap>(new Map<string, Measurement>());

  const handleAddMeasurement = () => {
    setShowMeasurementList(true);
  };

  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Body Measurements Entry</ModalHeader>
            <ModalBody>
              <div className="h-[270px] flex flex-col gap-1 overflow-auto pr-3">
                {showMeasurementList ? (
                  <Listbox label="Add Measurement">
                    {Array.from(measurementMap).map(([key, value]) => (
                      <ListboxItem
                        key={key}
                        variant="faded"
                      >
                        {value.name}
                      </ListboxItem>
                    ))}
                  </Listbox>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                <Button
                  variant="flat"
                  color="success"
                  onPress={handleAddMeasurement}
                >
                  Add Measurement
                </Button>
              </div>
              <div className="flex gap-2">
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={buttonAction}
                  isDisabled={!areActiveMeasurementsValid}
                >
                  {isEditing ? "Update" : "Save"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
