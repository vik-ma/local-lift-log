import { Select, SelectItem } from "@nextui-org/react";
import { ValidMeasurementsUnits } from "../helpers";
import { MeasurementDropdownProps } from "../typings";
import Database from "tauri-plugin-sql-api";
import toast, { Toaster } from "react-hot-toast";

export const MeasurementUnitDropdown = ({
  measurement,
  isDisabled,
  measurements,
  setMeasurements,
}: MeasurementDropdownProps) => {
  const value: string = measurement.default_unit;

  const measurementUnits: string[] = ValidMeasurementsUnits();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value: string = e.target.value;

    if (!measurementUnits.includes(value)) return;

    const updatedMeasurements = measurements.map((item) =>
      item.id === measurement.id ? { ...item, default_unit: value } : item
    );

    await updateMeasurementUnit(value);
    setMeasurements(updatedMeasurements);
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
        size="sm"
        className="max-w-20"
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
