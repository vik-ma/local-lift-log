import { Select, SelectItem } from "@heroui/react";
import { UnitDropdownProps } from "../../typings";
import { WEIGHT_UNITS } from "../../constants";

export const WeightUnitDropdown = ({
  value,
  setSet,
  updateUserSetting,
  setState,
  setEquipmentWeight,
  targetType,
  showLabel,
  isSmall,
  isSetEdited,
  setIsSetEdited,
  setPlateCollection,
  switchWeightUnit,
  showBigLabel,
  changeUnitInChart,
  customLabel,
  customWidthString,
}: UnitDropdownProps) => {
  const validWeightUnits = WEIGHT_UNITS;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        weight_unit: e.target.value,
      }));
    }

    if (targetType === "set-user-weight-unit" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        user_weight_unit: e.target.value,
      }));
    }

    if (
      isSetEdited !== undefined &&
      setIsSetEdited !== undefined &&
      !isSetEdited
    ) {
      setIsSetEdited(true);
    }

    if (targetType === "equipment" && setEquipmentWeight !== undefined) {
      setEquipmentWeight((prev) => ({ ...prev, weight_unit: e.target.value }));
    }

    if (targetType === "settings" && updateUserSetting !== undefined) {
      updateUserSetting("default_unit_weight", e.target.value);
    }

    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
    }

    if (targetType === "plate-collection" && setPlateCollection !== undefined) {
      setPlateCollection((prev) => ({ ...prev, weight_unit: e.target.value }));

      if (switchWeightUnit !== undefined) switchWeightUnit();
    }

    if (targetType === "chart" && changeUnitInChart !== undefined) {
      changeUnitInChart(e.target.value, "Weight");
    }
  };

  const showCustomLabel = customLabel !== undefined;

  return (
    <div>
      <Select
        aria-label="Weight Unit Dropdown List"
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
        {validWeightUnits.map((unit) => (
          <SelectItem key={unit}>{unit}</SelectItem>
        ))}
      </Select>
    </div>
  );
};
