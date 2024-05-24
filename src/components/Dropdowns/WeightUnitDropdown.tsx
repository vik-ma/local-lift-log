import { Select, SelectItem } from "@nextui-org/react";
import { UnitDropdownProps } from "../../typings";
import { useValidWeightUnits } from "../../hooks";

export const WeightUnitDropdown = ({
  value,
  setSet,
  setUserSettings,
  setState,
  targetType,
}: UnitDropdownProps) => {
  const validWeightUnits = useValidWeightUnits();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (targetType === "set" && setSet !== undefined) {
      setSet((prev) => ({
        ...prev,
        weight_unit: e.target.value,
      }));
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
      className="max-w-[4.5rem]"
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
