import { ReassignMeasurementIdForUserMeasurements } from "../helpers";
import {
  ReassignMeasurementsProps,
  Measurement,
  UserMeasurement,
  UseMeasurementListReturnType,
} from "../typings";
import { useState } from "react";
import useValidateName from "./useValidateName";
import { useDisclosure } from "@nextui-org/react";

export const useReassignMeasurement = (
  useMeasurementList: UseMeasurementListReturnType
) => {
  const [newMeasurementName, setNewMeasurementName] = useState<string>("");

  const isNewMeasurementNameValid = useValidateName(newMeasurementName);

  const [measurementToReassign, setMeasurementToReassign] =
    useState<ReassignMeasurementsProps>();

  const nameInputModal = useDisclosure();

  const { createMeasurement } = useMeasurementList;

  const handleReassignMeasurement = (values: ReassignMeasurementsProps) => {
    setMeasurementToReassign(values);
    nameInputModal.onOpen();
  };

  const reassignMeasurement = async (
    userMeasurements: UserMeasurement[]
  ): Promise<boolean> => {
    if (measurementToReassign === undefined || !isNewMeasurementNameValid)
      return false;

    const newMeasurement: Measurement = {
      id: 0,
      name: newMeasurementName,
      default_unit: measurementToReassign.unit,
      measurement_type: measurementToReassign.measurement_type,
      is_favorite: 0,
    };

    const newMeasurementId = await createMeasurement(newMeasurement);

    if (newMeasurementId === 0) return false;

    const success = await ReassignMeasurementIdForUserMeasurements(
      measurementToReassign.id,
      newMeasurementId.toString(),
      userMeasurements
    );

    if (!success) return false;

    setMeasurementToReassign(undefined);
    setNewMeasurementName("");

    return true;
  };

  return {
    newMeasurementName,
    setNewMeasurementName,
    isNewMeasurementNameValid,
    nameInputModal,
    handleReassignMeasurement,
    reassignMeasurement,
  };
};
