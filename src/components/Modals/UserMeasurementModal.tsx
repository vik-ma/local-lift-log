import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { useState } from "react";
import {
  GenerateActiveMeasurementString,
  UpdateActiveTrackingMeasurements,
} from "../../helpers";
import { MeasurementUnitDropdown } from "..";
import { Reorder } from "framer-motion";
import { Measurement } from "../../typings";

type UserMeasurementModalProps = {
  userMeasurementModal: ReturnType<typeof useDisclosure>;
  activeMeasurements: Measurement[];
  setActiveMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>;
  userSettingsId: number;
  measurementsCommentInput: string;
  setMeasurementsCommentInput: React.Dispatch<React.SetStateAction<string>>;
  invalidMeasurementInputs: Set<number>;
  handleActiveMeasurementInputChange: (value: string, index: number) => void;
  areActiveMeasurementInputsEmpty: boolean;
  buttonAction: () => void;
};

export const UserMeasurementModal = ({
  userMeasurementModal,
  activeMeasurements,
  setActiveMeasurements,
  userSettingsId,
  measurementsCommentInput,
  setMeasurementsCommentInput,
  invalidMeasurementInputs,
  handleActiveMeasurementInputChange,
  areActiveMeasurementInputsEmpty,
  buttonAction,
}: UserMeasurementModalProps) => {
  const [isReordering, setIsReordering] = useState<boolean>(false);

  const updateActiveTrackingMeasurementOrder = async () => {
    const activeTrackingMeasurementIdList: number[] = activeMeasurements.map(
      (obj) => obj.id
    );

    const activeTrackingMeasurementString: string =
      GenerateActiveMeasurementString(activeTrackingMeasurementIdList);

    await UpdateActiveTrackingMeasurements(
      activeTrackingMeasurementString,
      userSettingsId
    );

    setIsReordering(false);
  };
  return (
    <Modal
      isOpen={userMeasurementModal.isOpen}
      onOpenChange={userMeasurementModal.onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Edit Body Weight Entry</ModalHeader>
            <ModalBody>
              {isReordering ? (
                <div className="flex flex-col gap-2.5 items-center">
                  <div className="flex justify-center w-full">
                    <Reorder.Group
                      className="flex flex-col gap-1.5 w-full"
                      values={activeMeasurements}
                      onReorder={setActiveMeasurements}
                    >
                      {activeMeasurements.map((measurement) => (
                        <Reorder.Item key={measurement.id} value={measurement}>
                          <div className="w-80 h-11 leading-9 truncate cursor-grab active:cursor-grabbing bg-stone-100 hover:bg-white px-2 py-1 rounded outline outline-2 outline-stone-300">
                            <span className="text-lg text-stone-700">
                              {measurement.name}
                            </span>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {activeMeasurements.map((measurement, index) => (
                    <div
                      className="flex justify-between gap-2 items-center"
                      key={`measurement-${measurement.id}`}
                    >
                      <Input
                        value={measurement.input}
                        label={measurement.name}
                        size="sm"
                        variant="faded"
                        onValueChange={(value) =>
                          handleActiveMeasurementInputChange(value, index)
                        }
                        isInvalid={invalidMeasurementInputs.has(index)}
                        isClearable
                      />
                      <MeasurementUnitDropdown
                        value={measurement.default_unit}
                        measurements={activeMeasurements}
                        setMeasurements={setActiveMeasurements}
                        measurement={measurement}
                        targetType="active"
                        isDisabled={measurement.measurement_type === "Caliper"}
                      />
                    </div>
                  ))}
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
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <div className="flex justify-center gap-2">
                {!isReordering && (
                  <Button
                    className="font-medium"
                    variant="flat"
                    onPress={() => setIsReordering(true)}
                  >
                    Reorder Measurements
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {isReordering ? (
                  <>
                    <Button
                      className="font-medium"
                      variant="light"
                      color="success"
                      onPress={() => setIsReordering(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="font-medium"
                      color="success"
                      onPress={() => updateActiveTrackingMeasurementOrder()}
                    >
                      Save Reorder
                    </Button>
                  </>
                ) : (
                  <>
                    <Button color="success" variant="light" onPress={onClose}>
                      Close
                    </Button>
                    <Button
                      color="success"
                      onPress={buttonAction}
                      isDisabled={areActiveMeasurementInputsEmpty}
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
