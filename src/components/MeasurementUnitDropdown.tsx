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
  value,
  setUserSettings,
  targetType,
}: MeasurementDropdownProps) => {
  const measurementUnits: string[] = ValidMeasurementUnits();

  const displayValue: string =
    measurement !== undefined
      ? // Set display value as measurement.default_unit if measurement is passed down
        measurement.default_unit
      : value !== undefined
      ? // Set display value as value if value is passed down, but measurement is not
        value
      : measurementUnits[0];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value: string = e.target.value;
    if (!measurementUnits.includes(value)) return;

    if (
      targetType === "list" &&
      measurements !== undefined &&
      setMeasurements !== undefined &&
      measurement !== undefined
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

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings(e);
    }
  };

  const updateMeasurementUnit = async (value: string) => {
    if (measurement === undefined) return;

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
        aria-label="Measurement Unit Dropdown Menu"
        label={targetType === "settings" ? undefined : "Unit"}
        size={
          targetType === "modal"
            ? "lg"
            : targetType === "settings"
            ? "md"
            : "sm"
        }
        className={targetType === "settings" ? "max-w-[5rem]" : "w-20"}
        labelPlacement={targetType === "modal" ? "outside" : "inside"}
        variant="faded"
        selectedKeys={[displayValue]}
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
