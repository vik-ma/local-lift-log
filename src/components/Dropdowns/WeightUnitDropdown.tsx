import { Select, SelectItem } from "@nextui-org/react";
import { UnitDropdownProps } from "../../typings";
import { useValidWeightUnits } from "../../hooks";

export const WeightUnitDropdown = ({
  value,
  setSet,
  setUserSettings,
  setState,
  setEquipmentWeight,
  targetType,
  showLabel,
  isSmall,
}: UnitDropdownProps) => {
  const validWeightUnits = useValidWeightUnits();

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

    if (targetType === "equipment" && setEquipmentWeight !== undefined) {
      setEquipmentWeight((prev) => ({ ...prev, weight_unit: e.target.value }));
    }

    if (targetType === "settings" && setUserSettings !== undefined) {
      setUserSettings(e);
    }

    if (targetType === "state" && setState !== undefined) {
      setState(e.target.value);
    }
  };

  return (
    <Select
      aria-label="Weight Unit Dropdown List"
      label={showLabel ? "Unit" : null}
      className="max-w-[4.5rem]"
      size={isSmall ? "sm" : "md"}
      variant="faded"
      selectedKeys={[value]}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {validWeightUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default WeightUnitDropdown;
