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
import { useEffect, useState } from "react";

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
  updateActiveTrackingMeasurementOrder?: (
    newActiveMeasurements?: Measurement[]
  ) => void;
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
  const [isAddingMeasurement, setIsAddingMeasurement] =
    useState<boolean>(false);
  const [filteredMeasurements, setFilteredMeasurements] =
    useState<MeasurementMap>(new Map<string, Measurement>());

  useEffect(() => {
    setFilteredMeasurements(measurementMap);
  }, [measurementMap]);

  const showMeasurementList =
    isAddingMeasurement || activeMeasurements.length === 0;

  const handleAddMeasurement = () => {
    if (isAddingMeasurement) {
      setIsAddingMeasurement(false);
      return;
    }

    const filteredMeasurements: MeasurementMap = new Map<string, Measurement>(
      measurementMap
    );

    activeMeasurements.forEach((measurement) => {
      filteredMeasurements.delete(measurement.id.toString());
    });

    setFilteredMeasurements(filteredMeasurements);

    setIsAddingMeasurement(true);
  };

  const handleListboxClick = (key: string) => {
    const measurement = measurementMap.get(key);

    if (measurement === undefined) return;

    const newMeasurements = [
      ...activeMeasurements,
      { ...measurement, input: "" },
    ];

    setActiveMeasurements(newMeasurements);

    if (!isEditing) {
      // Update active_tracking_measurements string only if adding new Measurements
      updateActiveTrackingMeasurementOrder(newMeasurements);
    }

    setIsAddingMeasurement(false);
  };

  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {showMeasurementList
                ? "Add Measurement"
                : "Edit Body Measurements Entry"}
            </ModalHeader>
            <ModalBody>
              <div className="h-[270px] overflow-auto scroll-gradient">
                {showMeasurementList ? (
                  <Listbox
                    aria-label="Add Measurement"
                    emptyContent="No Measurements Created"
                    onAction={(key) => handleListboxClick(key as string)}
                  >
                    {Array.from(filteredMeasurements).map(([key, value]) => (
                      <ListboxItem
                        endContent={
                          <span className="text-sm font-light text-stone-400">
                            {value.measurement_type}
                          </span>
                        }
                        key={key}
                        variant="faded"
                      >
                        {value.name}
                      </ListboxItem>
                    ))}
                  </Listbox>
                ) : (
                  <div className="flex flex-col gap-1.5 pr-2.5">
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
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div>
                {activeMeasurements.length > 0 && (
                  <Button
                    className="w-40"
                    variant="flat"
                    onPress={handleAddMeasurement}
                  >
                    {isAddingMeasurement ? "Cancel" : "Add Measurement"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  onPress={buttonAction}
                  isDisabled={
                    !areActiveMeasurementsValid || isAddingMeasurement
                  }
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
