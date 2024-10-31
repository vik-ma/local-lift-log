import { Checkbox, CheckboxGroup } from "@nextui-org/react";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  value: string[];
  handleChange: (value: string[]) => void;
  exerciseGroupList: string[];
  isSecondary?: boolean;
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  value,
  handleChange,
  exerciseGroupList,
  isSecondary,
}: ExerciseGroupCheckboxesProps) => {
  return (
    <CheckboxGroup
      className="h-[14.75rem]"
      isRequired
      isInvalid={!isValid}
      value={value}
      aria-label={
        isSecondary
          ? "Select Secondary Exercise Groups"
          : "Select Primary Exercise Groups"
      }
      errorMessage={!isValid && "At least one Exercise Group must be selected"}
      onValueChange={(value) => handleChange(value)}
    >
      <div className="grid grid-cols-2 gap-0.5">
        {exerciseGroupList.map((group) => (
          <Checkbox key={group} color="primary" value={group}>
            {group}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  );
};
