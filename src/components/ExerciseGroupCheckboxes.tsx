import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { useExerciseGroupDictionary } from "../hooks";
import { useMemo } from "react";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  value: string[];
  handleChange: (value: string[]) => void;
  isSecondary?: boolean;
  useValueAsValue?: boolean;
  disabledKeys?: string[];
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  value,
  handleChange,
  isSecondary,
  useValueAsValue,
  disabledKeys,
}: ExerciseGroupCheckboxesProps) => {
  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const disabledKeysSet = useMemo(() => {
    return new Set(disabledKeys);
  }, [disabledKeys]);

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
          <Checkbox
            key={useValueAsValue ? value : key}
            color="primary"
            value={useValueAsValue ? value : key}
            isDisabled={disabledKeysSet.has(key)}
          >
            {value}
          </Checkbox>
        ))}
      </div>
    </CheckboxGroup>
  );
};
