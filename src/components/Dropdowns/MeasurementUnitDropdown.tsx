import { Select, SelectItem } from "@nextui-org/react";
import { MeasurementDropdownProps } from "../../typings";
import { useValidMeasurementUnits } from "../../hooks";

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
  const validMeasurementUnits = useValidMeasurementUnits();

  const displayValue: string =
    measurement !== undefined
      ? // Set display value as measurement.default_unit if measurement is passed down
        measurement.default_unit
      : value !== undefined
      ? // Set display value as value if value is passed down, but measurement is not
        value
      : validMeasurementUnits[0];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value: string = e.target.value;
    if (!validMeasurementUnits.includes(value)) return;

    if (targetType === "modal" && setMeasurement !== undefined) {
      setMeasurement((prev) => ({
        ...prev,
        default_unit: value,
      }));
    }

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings(e);
    }

    if (
      targetType === "active" &&
      measurements !== undefined &&
      setMeasurements !== undefined &&
      measurement !== undefined
    ) {
      const updatedMeasurements = measurements.map((item) =>
        item.id === measurement.id ? { ...item, default_unit: value } : item
      );
      setMeasurements(updatedMeasurements);
    }
  };

  return (
    <Select
      aria-label="Measurement Unit Dropdown List"
      label={
        targetType === "settings" || targetType === "active"
          ? undefined
          : "Unit"
      }
      size={
        targetType === "modal"
          ? "lg"
          : targetType === "settings" || targetType === "active"
          ? "md"
          : "sm"
      }
      className={
        targetType === "settings" || targetType === "active"
          ? "max-w-[5rem]"
          : "w-20"
      }
      labelPlacement={targetType === "modal" ? "outside" : "inside"}
      variant="faded"
      selectedKeys={[displayValue]}
      onChange={(e) => handleChange(e)}
      isDisabled={isDisabled}
      disallowEmptySelection
    >
      {validMeasurementUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default MeasurementUnitDropdown;
