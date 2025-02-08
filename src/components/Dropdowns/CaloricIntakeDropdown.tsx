import { Select, SelectItem } from "@heroui/react";
import { useCaloricIntakeTypes } from "../../hooks";
import { TimePeriod } from "../../typings";
import { ConvertEmptyStringToNull } from "../../helpers";

type CaloricIntakeDropdownProps = {
  value: string | null;
  targetType: "time-period";
  setTimePeriod?: React.Dispatch<React.SetStateAction<TimePeriod>>;
};

export const CaloricIntakeDropdown = ({
  value,
  targetType,
  setTimePeriod,
}: CaloricIntakeDropdownProps) => {
  const dietPhaseTypes = useCaloricIntakeTypes();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = ConvertEmptyStringToNull(e.target.value);

    if (targetType === "time-period" && setTimePeriod !== undefined) {
      setTimePeriod((prev) => ({
        ...prev,
        diet_phase: value,
      }));
    }
  };

  return (
    <Select
      label="Caloric Intake"
      variant="faded"
      size="sm"
      selectedKeys={value && dietPhaseTypes.includes(value) ? [value] : []}
      onChange={(e) => handleChange(e)}
    >
      {dietPhaseTypes.map((type) => (
        <SelectItem key={type} value={type}>
          {type}
        </SelectItem>
      ))}
    </Select>
  );
};
