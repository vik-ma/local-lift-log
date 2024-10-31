import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { useExerciseGroupDictionary } from "../hooks";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  value: string[];
  handleChange: (value: string[]) => void;
  isSecondary?: boolean;
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  value,
  handleChange,
  isSecondary,
}: ExerciseGroupCheckboxesProps) => {
  const exerciseGroupDictionary = useExerciseGroupDictionary();

  return (
    <CheckboxGroup
      isRequired
      isInvalid={!isValid}
      value={value}
      aria-label={
        isSecondary
          ? "Select Secondary Exercise Groups"
          : "Select Primary Exercise Groups"
      }
      errorMessage={
        !isValid && "At least one Primary Exercise Group must be selected"
      }
      onValueChange={(value) => handleChange(value)}
    >
      <div className="grid grid-cols-2 gap-0.5">
        {Array.from(exerciseGroupDictionary).map(([key, value]) => (
          <Checkbox key={key} color="primary" value={key}>
            {value}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  );
};
