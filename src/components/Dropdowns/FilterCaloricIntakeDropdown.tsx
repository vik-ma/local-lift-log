import { Select, SelectItem } from "@nextui-org/react";
import { useCaloricIntakeTypes } from "../../hooks";

type FilterCaloricIntakeDropdownProps = {
  values: Set<string>;
  setValues: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export const FilterCaloricIntakeDropdown = ({
  values,
  setValues,
}: FilterCaloricIntakeDropdownProps) => {
  const caloricIntakeTypes = useCaloricIntakeTypes();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedSet = new Set(e.target.value);
    setValues(updatedSet);
  };

  return (
    <Select
      selectionMode="multiple"
      label={
        <>
          Caloric Intake Types
          {values.size > 0 && (
            <span className="text-secondary">
              {" "}
              ({values.size} out of {caloricIntakeTypes.length})
            </span>
          )}
        </>
      }
      variant="faded"
      selectedKeys={values}
      onChange={(e) => handleChange(e)}
      disableAnimation
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
