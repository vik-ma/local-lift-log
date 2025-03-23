import { Select, SelectItem } from "@heroui/react";
import { MeasurementDropdownProps } from "../../typings";
import { useValidMeasurementUnits } from "../../hooks";

export const MeasurementUnitDropdown = ({
  targetType,
  measurement,
  isDisabled = false,
  measurements,
  setMeasurements,
  setMeasurement,
  value,
  setUserSettings,
  showLabel,
  showBigLabel,
  customLabel,
  changeUnitInChart,
  customWidthString,
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

    if (targetType === "chart" && changeUnitInChart !== undefined) {
      changeUnitInChart(e.target.value, "Circumference");
    }
  };

  const showCustomLabel = customLabel !== undefined;

  return (
    <div className="flex flex-col gap-0.5">
      {showBigLabel && (
        <h3 className="text-foreground-500 text-base px-0.5">Unit</h3>
      )}
      <Select
        aria-label="Measurement Unit Dropdown List"
        label={showCustomLabel ? customLabel : showLabel ? "Unit" : null}
        size={
          targetType === "modal"
            ? "lg"
            : targetType === "settings"
            ? "md"
            : "sm"
        }
        classNames={{
          label: showCustomLabel ? "pl-[3px] mt-1 text-clip" : "",
          mainWrapper:
            customWidthString !== undefined ? customWidthString : "w-[5rem]",
        }}
        labelPlacement={
          targetType === "modal" || showCustomLabel ? "outside" : "inside"
        }
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
    </div>
  );
};

export default MeasurementUnitDropdown;
