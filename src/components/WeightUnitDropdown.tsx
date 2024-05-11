import { Select, SelectItem } from "@nextui-org/react";
import { ValidWeightUnits } from "../helpers";
import { UnitDropdownProps } from "../typings";

export const WeightUnitDropdown = ({
  value,
  setSet,
  setUserSettings,
  setState,
  targetType,
}: UnitDropdownProps) => {
  const weightUnits: string[] = ValidWeightUnits();

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
      {weightUnits.map((unit) => (
        <SelectItem key={unit} value={unit}>
          {unit}
        </SelectItem>
      ))}
    </Select>
  );
};

export default WeightUnitDropdown;
