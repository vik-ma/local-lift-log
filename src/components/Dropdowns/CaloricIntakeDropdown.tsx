import { Select, SelectItem } from "@nextui-org/react";
import { useCaloricIntakeTypes } from "../../hooks";
import { TimePeriod } from "../../typings";

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
    if (targetType === "time-period" && setTimePeriod !== undefined) {
      setTimePeriod((prev) => ({
        ...prev,
        caloric_intake: e.target.value,
      }));
    }
  };

  return (
    <Select
      label="Caloric Intake"
      variant="faded"
      selectedKeys={value ? [value] : undefined}
      onChange={(e) => handleChange(e)}
      disallowEmptySelection
    >
      {caloricIntakeTypes.map((type) => (
        <SelectItem key={type} value={type}>
          {type}
        </SelectItem>
      ))}
    </Select>
  );
};
