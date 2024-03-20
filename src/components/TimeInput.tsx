import { Input, Select, SelectItem } from "@nextui-org/react";
import { WorkoutSet } from "../typings";
import { useState, useMemo } from "react";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
};

export const TimeInput = ({ value, setValue }: TimeInputProps) => {
  const [inputType, setInputType] = useState<string>("hhmmss");

  const secondsDefaultValue =
    value.time_in_seconds === 0 ? "" : value.time_in_seconds.toString();

  const [secondsInput, setSecondsInput] = useState<string>(secondsDefaultValue);

  const handleChange = () => {
    setValue((prev) => ({ ...prev, time_in_seconds: 5 }));
  };

  const isSecondsInputInvalid = useMemo(() => {
    return !Number.isInteger(Number(secondsInput));
  }, [secondsInput]);

  const handleSecondsInput = (value: string) => {
    setSecondsInput(value);

    const trimmedValue = value.trim();

    const numberValue = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (Number.isInteger(Number(numberValue))) {
      setValue((prev) => ({ ...prev, time_in_seconds: numberValue }));
    }
  };

  return (
    <div className="flex justify-between gap-2">
      <div className="flex items-center">
        {inputType === "hhmmss" && "HH:MM:SS"}
        {inputType === "minutes" && "Minutes"}
        {inputType === "seconds" && (
          <Input
            label="Seconds"
            size="sm"
            variant="faded"
            isClearable
            value={secondsInput}
            onValueChange={(value) => handleSecondsInput(value)}
            isInvalid={isSecondsInputInvalid}
          />
        )}
      </div>
      <Select
        className="w-32"
        label="Input Type"
        size="sm"
        variant="faded"
        selectedKeys={[inputType]}
        disallowEmptySelection={true}
        onChange={(e) => setInputType(e.target.value)}
      >
        <SelectItem key="hhmmss" value={"hhmmss"}>
          HH:MM:SS
        </SelectItem>
        <SelectItem key="minutes" value={"minutes"}>
          Minutes
        </SelectItem>
        <SelectItem key="seconds" value={"seconds"}>
          Seconds
        </SelectItem>
      </Select>
    </div>
  );
};

export default TimeInput;
