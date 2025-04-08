import { Select, SelectItem } from "@heroui/react";
import { useValidMeasurementUnits } from "../../hooks";
import { Measurement, UnitCategory, UpdateUserSettingFunction } from "../../typings";

type MeasurementDropdownProps = {
  targetType: "modal" | "settings" | "active" | "chart";
  measurement?: Measurement;
  isDisabled?: boolean;
  measurements?: Measurement[];
  setMeasurements?: React.Dispatch<React.SetStateAction<Measurement[]>>;
  setMeasurement?: React.Dispatch<React.SetStateAction<Measurement>>;
  value?: string;
  updateUserSetting?: UpdateUserSettingFunction;
  showLabel?: boolean;
  showBigLabel?: boolean;
  customLabel?: string;
  changeUnitInChart?: (
    newUnit: string,
    unitCategory: UnitCategory
  ) => void;
  customWidthString?: string;
};

export const MeasurementUnitDropdown = ({
  targetType,
  measurement,
  isDisabled = false,
  measurements,
  setMeasurements,
  setMeasurement,
  value,
  updateUserSetting,
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

    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("default_unit_measurement", e.target.value);
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
    <div>
      <Select
        aria-label="Measurement Unit Dropdown List"
        label={
          showCustomLabel
            ? customLabel
            : showLabel || showBigLabel
            ? "Unit"
            : null
        }
        labelPlacement={
          targetType === "modal" || showCustomLabel || showBigLabel
            ? "outside"
            : "inside"
        }
        classNames={{
          label: showBigLabel
            ? "!text-foreground-500 text-base pl-0.5 mt-[5px] text-clip"
            : showCustomLabel
            ? "pl-[3px] mt-1 text-clip"
            : "",
          mainWrapper:
            customWidthString !== undefined
              ? customWidthString
              : showBigLabel
              ? "w-[5rem] mt-[3px]"
              : "w-[5rem]",
        }}
        size={targetType === "modal" || targetType === "settings" ? "md" : "sm"}
        variant="faded"
        selectedKeys={[displayValue]}
        onChange={(e) => handleChange(e)}
        isDisabled={isDisabled}
        disallowEmptySelection
      >
        {validMeasurementUnits.map((unit) => (
          <SelectItem key={unit}>{unit}</SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default MeasurementUnitDropdown;
