import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { ExerciseGroupMap } from "../typings";

type ExerciseGroupCheckboxesProps = {
  isValid: boolean;
  defaultValue: string[];
  handleChange: (value: string[]) => void;
  exerciseGroupDictionary: ExerciseGroupMap;
};

export const ExerciseGroupCheckboxes = ({
  isValid,
  defaultValue,
  handleChange,
  exerciseGroupDictionary,
}: ExerciseGroupCheckboxesProps) => {
  return (
    <div>
      <CheckboxGroup
        className="h-[17rem]"
        isRequired
        isInvalid={!isValid}
        defaultValue={defaultValue}
        label="Select Exercise Groups"
        errorMessage={
          !isValid && "At least one Exercise Group must be selected"
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
    </div>
  );
};
