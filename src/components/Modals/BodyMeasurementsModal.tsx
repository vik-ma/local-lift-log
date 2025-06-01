import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ScrollShadow,
  Tooltip,
} from "@heroui/react";
import {
  EmptyListLabel,
  MeasurementModalList,
  BodyMeasurementsReorderItem,
  WeightUnitDropdown,
} from "..";
import { Reorder } from "framer-motion";
import {
  BodyMeasurements,
  Measurement,
  MeasurementMap,
  UseActiveMeasurementsReturnType,
  UseDisclosureReturnType,
  UseMeasurementListReturnType,
} from "../../typings";
import { useMemo, useState } from "react";
import {
  CalculateBodyFatPercentage,
  ConvertBodyMeasurementsValuesToMeasurementInputs,
  DeleteItemFromList,
  IsStringEmpty,
  IsStringInvalidNumber,
} from "../../helpers";

type BodyMeasurementsModalProps = {
  bodyMeasurementsModal: UseDisclosureReturnType;
  useActiveMeasurements: UseActiveMeasurementsReturnType;
  useMeasurementList: UseMeasurementListReturnType;
  doneButtonAction: () => void;
  isEditing: boolean;
};

type ModalPage = "base" | "measurement-list";

export const BodyMeasurementsModal = ({
  bodyMeasurementsModal,
  useActiveMeasurements,
  useMeasurementList,
  doneButtonAction,
  isEditing,
}: BodyMeasurementsModalProps) => {
  const [modalPage, setModalPage] = useState<ModalPage>("base");
  const [weightInput, setWeightInput] = useState<string>("");
  const [commentInput, setCommentInput] = useState<string>("");
  const [bodyFatPercentageInput, setBodyFatPercentageInput] =
    useState<string>("");
  const [invalidMeasurementInputs, setInvalidMeasurementInputs] = useState<
    Set<number>
  >(new Set<number>());

  const {
    weightUnit,
    setWeightUnit,
    isMale,
    ageGroup,
    activeMeasurementsValue,
    activeMeasurements,
    setActiveMeasurements,
    updateActiveTrackingMeasurementOrder,
    bodyFatMeasurementsMap,
    validBodyFatInputs,
  } = useActiveMeasurements;

  const isWeightInputValid = useMemo(() => {
    if (IsStringEmpty(weightInput)) return true;
    if (IsStringInvalidNumber(weightInput, 0, true)) return false;

    return true;
  }, [weightInput]);

  const isBodyFatPercentageInputValid = useMemo(() => {
    if (IsStringEmpty(bodyFatPercentageInput)) return true;
    if (IsStringInvalidNumber(bodyFatPercentageInput, 0, true, 100))
      return false;

    return true;
  }, [bodyFatPercentageInput]);

  const areActiveMeasurementsInputsEmpty = useMemo(() => {
    let isEmpty = true;

    let i = 0;
    while (isEmpty && i < activeMeasurements.length) {
      if (activeMeasurements[i].input!.trim().length !== 0) isEmpty = false;
      i++;
    }

    return isEmpty;
  }, [activeMeasurements]);

  const areBodyMeasurementsValid = useMemo(() => {
    if (!isWeightInputValid) return false;
    if (!isBodyFatPercentageInputValid) return false;
    if (invalidMeasurementInputs.size > 0) return false;
    if (
      IsStringEmpty(weightInput) &&
      IsStringEmpty(bodyFatPercentageInput) &&
      areActiveMeasurementsInputsEmpty
    )
      return false;

    return true;
  }, [
    isWeightInputValid,
    isBodyFatPercentageInputValid,
    invalidMeasurementInputs,
    weightInput,
    bodyFatPercentageInput,
    areActiveMeasurementsInputsEmpty,
  ]);

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

  const validateActiveMeasurementInput = (value: string, index: number) => {
    const updatedInvalidInputs = new Set(invalidMeasurementInputs);
    if (!IsStringEmpty(value) && IsStringInvalidNumber(value, 0, true)) {
      updatedInvalidInputs.add(index);
    } else {
      updatedInvalidInputs.delete(index);
    }

    setInvalidMeasurementInputs(updatedInvalidInputs);
  };

  const validateBodyFatMeasurementInput = (value: string, id: number) => {
    if (!bodyFatMeasurementsMap.has(id)) return;

    if (IsStringInvalidNumber(value, 0, true)) {
      validBodyFatInputs.current.delete(id);
    } else {
      validBodyFatInputs.current.add(id);
    }
  };

  const handleActiveMeasurementInputChange = (value: string, index: number) => {
    const updatedInputs = [...activeMeasurements];
    updatedInputs[index] = { ...updatedInputs[index], input: value };
    setActiveMeasurements(updatedInputs);
    validateActiveMeasurementInput(value, index);
    validateBodyFatMeasurementInput(value, updatedInputs[index].id);
  };

  const resetBodyMeasurementsInput = () => {
    setWeightInput("");
    setCommentInput("");
    setBodyFatPercentageInput("");
    validBodyFatInputs.current = new Set();

    const updatedInputs = activeMeasurementsValue.current.map(
      (measurement) => ({
        ...measurement,
        input: "",
      })
    );

    setActiveMeasurements(updatedInputs);
  };

  const loadBodyMeasurementsInputs = (
    bodyMeasurements: BodyMeasurements,
    measurementMap: MeasurementMap
  ) => {
    if (bodyMeasurements.bodyMeasurementsValues === undefined) return;

    setWeightInput(
      bodyMeasurements.weight === 0 ? "" : bodyMeasurements.weight.toString()
    );
    setCommentInput(bodyMeasurements.comment ?? "");
    setBodyFatPercentageInput(
      bodyMeasurements.body_fat_percentage
        ? bodyMeasurements.body_fat_percentage.toString()
        : ""
    );
    setWeightUnit(bodyMeasurements.weight_unit);

    const { updatedActiveMeasurements, updatedValidBodyFatInputs } =
      ConvertBodyMeasurementsValuesToMeasurementInputs(
        bodyMeasurements.bodyMeasurementsValues,
        measurementMap,
        bodyFatMeasurementsMap
      );

    setActiveMeasurements(updatedActiveMeasurements);
    validBodyFatInputs.current = updatedValidBodyFatInputs;
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

  const calculateBodyFatPercentage = () => {
    if (validBodyFatInputs.current.size !== 4) return;

    const measurementInputs: string[] = [];

    for (const measurement of activeMeasurements) {
      if (validBodyFatInputs.current.has(measurement.id)) {
        measurementInputs.push(measurement.input!);
      }
    }

    const bodyFatPercentage = CalculateBodyFatPercentage(
      isMale,
      ageGroup,
      measurementInputs
    );

    setBodyFatPercentageInput(bodyFatPercentage.toString());
  };

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
                  bodyFatMeasurementsMap={bodyFatMeasurementsMap}
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
                    <div className="flex items-center gap-1.5">
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
                      <Tooltip
                        content="All four BF% inputs needs to be valid"
                        isDisabled={validBodyFatInputs.current.size === 4}
                      >
                        {/* Span is needed for Tooltip to show when Button is disabled */}
                        <span>
                          <Button
                            className="w-[6rem]"
                            color="secondary"
                            variant="flat"
                            isDisabled={validBodyFatInputs.current.size !== 4}
                            onPress={calculateBodyFatPercentage}
                          >
                            Calculate
                          </Button>
                        </span>
                      </Tooltip>
                    </div>
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
                          isBodyFatCalculationMeasurement={bodyFatMeasurementsMap.has(
                            measurement.id
                          )}
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
