import { useState, useEffect, useMemo } from "react";
import { LoadingSpinner } from "../components";
import Database from "tauri-plugin-sql-api";
import { EquipmentWeight, UserSettingsOptional } from "../typings";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { GetDefaultUnitValues } from "../helpers";

export default function EquipmentWeights() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [equipmentWeights, setEquipmentWeights] = useState<EquipmentWeight[]>();
  const [newEquipmentName, setNewEquipmentName] = useState<string>("");
  const [newWeightInput, setNewWeightInput] = useState<string>("");
  const [newWeightUnit, setNewWeightUnit] = useState<string>("");
  const [userSettings, setUserSettings] = useState<UserSettingsOptional>();

  const newEquipmentModal = useDisclosure();

  useEffect(() => {
    const loadUserSettings = async () => {
      const settings: UserSettingsOptional | undefined =
        await GetDefaultUnitValues();
      if (settings !== undefined) {
        setUserSettings(settings);
        setNewWeightUnit(settings.default_unit_weight!);
      }
    };

    const getEquipmentWeights = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<EquipmentWeight[]>(
          "SELECT * FROM equipment_weights"
        );

        const equipmentWeights: EquipmentWeight[] = result.map((row) => ({
          id: row.id,
          name: row.name,
          weight: row.weight,
          weight_unit: row.weight_unit,
        }));

        setEquipmentWeights(equipmentWeights);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    loadUserSettings();
    getEquipmentWeights();
  }, []);

  const isNewEquipmentNameInvalid = useMemo(() => {
    return (
      newEquipmentName === null ||
      newEquipmentName === undefined ||
      newEquipmentName.trim().length === 0
    );
  }, [newEquipmentName]);

  return (
    <>
      <Modal
        isOpen={newEquipmentModal.isOpen}
        onOpenChange={newEquipmentModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                New Equipment Weight
              </ModalHeader>
              <ModalBody>
                <Input
                  value={newEquipmentName}
                  isInvalid={isNewEquipmentNameInvalid}
                  label="Name"
                  errorMessage={
                    isNewEquipmentNameInvalid && "Name can't be empty"
                  }
                  variant="faded"
                  onValueChange={(value) => setNewEquipmentName(value)}
                  isRequired
                  isClearable
                />
                <Input
                  // value={}
                  label="Weight"
                  variant="faded"
                  // onValueChange={(value) =>}
                  isClearable
                />
                <div className="flex justify-between items-center px-1 gap-4"></div>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="success"
                  // onPress={}
                  // isDisabled={}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-neutral-900 px-6 py-4 rounded-xl">
          <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
            Equipment
          </h1>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex flex-col gap-1 w-full">
              {equipmentWeights?.map((equipment) => (
                <div
                  className="flex flex-row justify-between gap-4 bg-white rounded-xl py-2 px-2.5 items-center"
                  key={`${equipment}`}
                >
                  <div className="flex flex-row justify-between w-full">
                    <span>{equipment.name}</span>
                    <span>
                      {equipment.weight}
                      {equipment.weight_unit}
                    </span>
                  </div>
                  <div className="flex justify-end gap-1">
                    <Button color="primary" size="sm">
                      Edit
                    </Button>
                    <Button color="danger" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-center mt-1">
                <Button
                  color="success"
                  onPress={() => newEquipmentModal.onOpen()}
                >
                  Create New Equipment Weight
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
