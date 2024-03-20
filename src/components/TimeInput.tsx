import { Input, Select, SelectItem } from "@nextui-org/react";
import { WorkoutSet } from "../typings";
import { useState, useMemo } from "react";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
};

type HoursMinutesSecondsInput = {
  seconds: string;
  minutes: string;
  hours: string;
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

  const convertSecondsToHoursMinutesSeconds = (
    seconds: number
  ): HoursMinutesSecondsInput => {
    if (seconds === 0) return { seconds: "", minutes: "", hours: "" };

    const hours = Math.floor(seconds / 3600);
    const remainingSecondsAfterHours = seconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const remainingSeconds = remainingSecondsAfterHours % 60;

    const hoursMinutesSecondsInput: HoursMinutesSecondsInput = {
      hours: hours === 0 ? "" : hours.toString(),
      minutes: minutes === 0 ? "" : minutes.toString(),
      seconds: remainingSeconds.toString(),
    };
    return hoursMinutesSecondsInput;
  };

  const hoursMinutesSecondsDefaultValue: HoursMinutesSecondsInput =
    convertSecondsToHoursMinutesSeconds(value.time_in_seconds);

  const [secondsInput, setSecondsInput] = useState<string>(secondsDefaultValue);
  const [minutesInput, setMinutesInput] = useState<string>(minutesDefaultValue);
  const [hoursMinutesSecondsInput, setHoursMinutesSecondsInput] =
    useState<HoursMinutesSecondsInput>(hoursMinutesSecondsDefaultValue);

  const isNumberNegativeOrInfinity = (number: number): boolean => {
    if (number < 0) return true;
    if (!isFinite(number)) return true;
    return false;
  };

  const isSecondsInputInvalid = useMemo(() => {
    const secondsNumber = Number(secondsInput);
    if (!Number.isInteger(secondsNumber)) return true;
    return isNumberNegativeOrInfinity(secondsNumber);
  }, [secondsInput]);

  const isMinutesInputInvalid = useMemo(() => {
    const minutesNumber = Number(minutesInput);
    if (isNaN(minutesNumber)) return true;
    return isNumberNegativeOrInfinity(minutesNumber);
  }, [minutesInput]);

  const handleSecondsInput = (value: string) => {
    setSecondsInput(value);
    const trimmedValue = value.trim();
    const seconds = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (isNumberNegativeOrInfinity(seconds) || !Number.isInteger(seconds))
      return;

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
    setMinutesInput(convertSecondsToMinutes(seconds));
  };

  const handleMinutesInput = (value: string) => {
    setMinutesInput(value);
    const trimmedValue = value.trim();
    const minutes = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (isNumberNegativeOrInfinity(minutes)) return;

    const seconds: number = convertMinutesToSeconds(minutes);

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
    setSecondsInput(seconds.toString());
  };

  const convertMinutesToSeconds = (minutes: number): number => {
    return Math.floor(minutes * 60);
  };

  return (
    <div className="flex justify-between gap-2">
      <div className="flex">
        {inputType === "hhmmss" && (
          <div className="flex gap-1 w-full">
            <Input label="Hours" size="sm" variant="faded" isClearable />
            <Input label="Minutes" size="sm" variant="faded" isClearable />
            <Input label="Seconds" size="sm" variant="faded" isClearable />
          </div>
        )}
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
      <div>
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
    </div>
  );
};

export default TimeInput;
