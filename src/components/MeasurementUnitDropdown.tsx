import { Select, SelectItem } from "@nextui-org/react";
import { ValidMeasurementUnits } from "../helpers";
import { MeasurementDropdownProps } from "../typings";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";

export const MeasurementUnitDropdown = ({
  measurement,
  isDisabled = false,
  measurements,
  setMeasurements,
  setMeasurement,
  targetType,
}: MeasurementDropdownProps) => {
  const value: string = measurement.default_unit;

  const measurementUnits: string[] = ValidMeasurementUnits();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value: string = e.target.value;
    if (!measurementUnits.includes(value)) return;

    if (
      targetType === "list" &&
      measurements !== undefined &&
      setMeasurements !== undefined
    ) {
      const updatedMeasurements = measurements.map((item) =>
        item.id === measurement.id ? { ...item, default_unit: value } : item
      );

      await updateMeasurementUnit(value);
      setMeasurements(updatedMeasurements);
    }

    if (targetType === "modal" && setMeasurement !== undefined) {
      setMeasurement((prev) => ({
        ...prev,
        default_unit: value,
      }));
    }
  };

  const updateMeasurementUnit = async (value: string) => {
    try {
      const db = await Database.load(import.meta.env.VITE_DB);

      db.execute(`UPDATE measurements SET default_unit = $1 WHERE id = $2`, [
        value,
        measurement.id,
      ]);

      toast.success("Measurement Unit Updated");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 1200 }} />
      <Select
        label="Unit"
        size={targetType === "modal" ? "lg" : "sm"}
        className="w-20"
        labelPlacement={targetType === "modal" ? "outside" : "inside"}
        variant="faded"
        selectedKeys={[value]}
        onChange={(e) => handleChange(e)}
        isDisabled={isDisabled}
      >
        {measurementUnits.map((unit) => (
          <SelectItem key={unit} value={unit}>
            {unit}
          </SelectItem>
        ))}
      </Select>
    </>
  );
};

export default MeasurementUnitDropdown;
