import { Select, SelectItem } from "@nextui-org/react";
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
  const caloricIntakeTypes = useCaloricIntakeTypes();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = ConvertEmptyStringToNull(e.target.value);

    if (targetType === "time-period" && setTimePeriod !== undefined) {
      setTimePeriod((prev) => ({
        ...prev,
        caloric_intake: value,
      }));
    }
  };

  return (
    <Select
      label="Caloric Intake"
      variant="faded"
      size="sm"
      selectedKeys={value && caloricIntakeTypes.includes(value) ? [value] : []}
      onChange={(e) => handleChange(e)}
    >
      {caloricIntakeTypes.map((type) => (
        <SelectItem key={type} value={type}>
          {type}
        </SelectItem>
      ))}
    </Select>
  );
};
