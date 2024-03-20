import { Input, Select, SelectItem } from "@nextui-org/react";
import { WorkoutSet } from "../typings";
import { useState, useMemo } from "react";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
};

export const TimeInput = ({ value, setValue }: TimeInputProps) => {
  const [inputType, setInputType] = useState<string>("hhmmss");

  const secondsDefaultValue: string =
    value.time_in_seconds === 0 ? "" : value.time_in_seconds.toString();

  const convertSecondsToMinutes = (seconds: number): string => {
    if (seconds === 0) return "";
    const minutes = seconds / 60;
    const minutesTrimmed = Math.round(minutes * 100) / 100;
    return minutesTrimmed.toString();
  };

  const minutesDefaultValue: string = convertSecondsToMinutes(
    value.time_in_seconds
  );

  const [secondsInput, setSecondsInput] = useState<string>(secondsDefaultValue);
  const [minutesInput, setMinutesInput] = useState<string>(minutesDefaultValue);

  const isNumberNegative = (number: number): boolean => {
    if (number < 0) return true;
    return false;
  };

  const isSecondsInputInvalid = useMemo(() => {
    const secondsNumber = Number(secondsInput);
    if (!Number.isInteger(secondsNumber)) return true;
    return isNumberNegative(secondsNumber);
  }, [secondsInput]);

  const isMinutesInputInvalid = useMemo(() => {
    const minutesNumber = Number.parseFloat(minutesInput);
    if (isNaN(minutesNumber)) return true;
    return isNumberNegative(minutesNumber);
  }, [minutesInput]);

  const handleSecondsInput = (value: string) => {
    setSecondsInput(value);
    const trimmedValue = value.trim();
    const seconds = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (isNumberNegative(seconds)) return;

    if (Number.isInteger(seconds)) {
      setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
      setMinutesInput(convertSecondsToMinutes(seconds));
    }
  };

  const handleMinutesInput = (value: string) => {
    setMinutesInput(value);
  };

  return (
    <div className="flex justify-between gap-2">
      <div className="flex items-center">
        {inputType === "hhmmss" && "HH:MM:SS"}
        {inputType === "minutes" && (
          <Input
            label="Minutes"
            size="sm"
            variant="faded"
            isClearable
            value={minutesInput}
            onValueChange={(value) => handleMinutesInput(value)}
            isInvalid={isMinutesInputInvalid}
          />
        )}
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
