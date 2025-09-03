import { Select, SelectItem } from "@heroui/react";
import { UnitDropdownProps } from "../../typings";
import { DISTANCE_UNITS } from "../../constants";

export const DistanceUnitDropdown = ({
  value,
  setSet,
  updateUserSetting,
  setState,
  setDistance,
  targetType,
  showLabel,
  isSmall,
  isSetEdited,
  setIsSetEdited,
  showBigLabel,
  changeUnitInChart,
  customLabel,
  customWidthString,
}: UnitDropdownProps) => {
  const validDistanceUnits = DISTANCE_UNITS;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        distance_unit: e.target.value,
      }));

      if (isSetEdited !== undefined && setIsSetEdited && !isSetEdited) {
        setIsSetEdited(true);
      }
    }

    if (targetType === "distance" && setDistance !== undefined) {
      setDistance((prev) => ({ ...prev, distance_unit: e.target.value }));
    }

    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("default_unit_distance", e.target.value);
    }

    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
    }

    if (targetType === "chart" && changeUnitInChart !== undefined) {
      changeUnitInChart(e.target.value, "Distance");
    }
  };

  const showCustomLabel = customLabel !== undefined;

  return (
    <div>
      <Select
        aria-label="Distance Unit Dropdown List"
        label={
          showCustomLabel
            ? customLabel
            : showLabel || showBigLabel
            ? "Unit"
            : null
        }
        labelPlacement={showCustomLabel || showBigLabel ? "outside" : "inside"}
        classNames={{
          label: showBigLabel
            ? "!text-default-500 text-base font-semibold pl-0.5 mt-1.5"
            : showCustomLabel
            ? "pl-[3px] mt-1"
            : "",
          mainWrapper:
            customWidthString !== undefined
              ? customWidthString
              : showLabel
              ? "w-[5rem]"
              : showBigLabel
              ? "w-[4.5rem] mt-0.5"
              : "w-[4.5rem]",
        }}
        size={isSmall ? "sm" : "md"}
        variant="faded"
        selectedKeys={[value]}
        onChange={(e) => handleChange(e)}
        disallowEmptySelection
      >
        {validDistanceUnits.map((unit) => (
          <SelectItem key={unit}>{unit}</SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default DistanceUnitDropdown;
