import { ReassignMeasurementIdForBodyMeasurements } from "../helpers";
import {
  ReassignMeasurementsProps,
  Measurement,
  UseMeasurementListReturnType,
  BodyMeasurements,
} from "../typings";
import { useState } from "react";
import { useDisclosure } from "@heroui/react";

export const useReassignMeasurement = (
  useMeasurementList: UseMeasurementListReturnType
) => {
  const [measurementToReassign, setMeasurementToReassign] =
    useState<ReassignMeasurementsProps>();

  const nameInputModal = useDisclosure();

  const { createMeasurement } = useMeasurementList;

  const handleReassignMeasurement = (values: ReassignMeasurementsProps) => {
    setMeasurementToReassign(values);
    nameInputModal.onOpen();
  };

  const reassignMeasurement = async (
    bodyMeasurements: BodyMeasurements[],
    newMeasurementName: string
  ) => {
    if (measurementToReassign === undefined) return false;

    const newMeasurement: Measurement = {
      id: 0,
      name: newMeasurementName,
      default_unit: measurementToReassign.unit,
      measurement_type: measurementToReassign.measurement_type,
      is_favorite: 0,
    };

    const newMeasurementId = await createMeasurement(newMeasurement);

    if (newMeasurementId === 0) return false;

    const success = await ReassignMeasurementIdForBodyMeasurements(
      measurementToReassign.id,
      newMeasurementId.toString(),
      bodyMeasurements
    );

    if (!success) return false;

    setMeasurementToReassign(undefined);

    return true;
  };

  return {
    nameInputModal,
    handleReassignMeasurement,
    reassignMeasurement,
  };
};
