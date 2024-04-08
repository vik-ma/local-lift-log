import { useState, useEffect } from "react";
import { LoadingSpinner, MeasurementUnitDropdown } from "../components";
import { Measurement, SetMeasurementsAction } from "../typings";
import Database from "tauri-plugin-sql-api";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

export default function MeasurementsListPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [operatingMeasurement, setOperatingMeasurement] =
    useState<Measurement>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const deleteModal = useDisclosure();
  const newMeasurementModal = useDisclosure();

  useEffect(() => {
    const getMeasurements = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Measurement[]>(
          "SELECT * FROM measurements"
        );

        setMeasurements(result);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getMeasurements();
  }, []);

  const deleteMeasurement = async () => {
    if (operatingMeasurement === undefined) return;

    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute("DELETE from measurements WHERE id = $1", [
        operatingMeasurement.id,
      ]);

      const updatedMeasurements: Measurement[] = measurements.filter(
        (item) => item.id !== operatingMeasurement?.id
      );
      setMeasurements(updatedMeasurements);

      toast.success("Measurement Deleted");
    } catch (error) {
      console.log(error);
    }

    setOperatingMeasurement(undefined);
    deleteModal.onClose();
  };

  const handleDeleteButtonPress = (measurement: Measurement) => {
    setOperatingMeasurement(measurement);
    deleteModal.onOpen();
  };

  const handleAddButtonPressed = () => {
    newMeasurementModal.onOpen();
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Measurement
              </ModalHeader>
              <ModalBody>
                <p className="break-all">
                  Are you sure you want to permanently delete{" "}
                  {operatingMeasurement?.name} measurement?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={deleteMeasurement}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={newMeasurementModal.isOpen}
        onOpenChange={newMeasurementModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                New Measurement
              </ModalHeader>
              <ModalBody></ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="success">Create</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b truncate">
            Measurements
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="w-full">
              <div className="flex flex-col gap-1.5">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="flex flex-row justify-between items-center rounded-lg px-2 py-1 outline outline-2 outline-stone-300 bg-white hover:bg-stone-100"
                  >
                    <div className="flex flex-col">
                      <div className="text-lg truncate w-56">
                        {measurement.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {measurement.measurement_type}
                      </div>
                    </div>
                    <div className="flex justify-between gap-1 items-center">
                      <MeasurementUnitDropdown
                        measurement={measurement}
                        isDisabled={
                          measurement.measurement_type === "Caliper"
                            ? true
                            : false
                        }
                        measurements={measurements}
                        setMeasurements={
                          setMeasurements as SetMeasurementsAction
                        }
                      />
                      <Button
                        color="danger"
                        onPress={() => handleDeleteButtonPress(measurement)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex gap-1 justify-center">
          <Button color="success" onPress={handleAddButtonPressed}>
            Add Measurement
          </Button>
        </div>
      </div>
    </>
  );
}
