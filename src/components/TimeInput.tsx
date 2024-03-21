import { Input, Select, SelectItem } from "@nextui-org/react";
import { WorkoutSet } from "../typings";
import { useState, useMemo } from "react";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
};

type HoursMinutesSecondsInput = {
  hours: string;
  minutes: string;
  seconds: string;
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

  const isNumberAbove59 = (number: number): boolean => {
    if (number > 59) return true;
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

  const isHhmmssSecondsInputInvalid = useMemo(() => {
    const secondsNumber = Number(hoursMinutesSecondsInput.seconds);
    if (!Number.isInteger(secondsNumber) || isNumberAbove59(secondsNumber))
      return true;
    return isNumberNegativeOrInfinity(secondsNumber);
  }, [hoursMinutesSecondsInput.seconds]);

  const isHhmmssMinutesInputInvalid = useMemo(() => {
    const minutesNumber = Number(hoursMinutesSecondsInput.minutes);
    if (!Number.isInteger(minutesNumber) || isNumberAbove59(minutesNumber))
      return true;
    return isNumberNegativeOrInfinity(minutesNumber);
  }, [hoursMinutesSecondsInput.minutes]);

  const isHhmmssHoursInputInvalid = useMemo(() => {
    const hoursNumber = Number(hoursMinutesSecondsInput.hours);
    if (!Number.isInteger(hoursNumber)) return true;
    return isNumberNegativeOrInfinity(hoursNumber);
  }, [hoursMinutesSecondsInput.hours]);

  const handleSecondsInputChange = (value: string) => {
    setSecondsInput(value);
    const trimmedValue = value.trim();
    const seconds = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (isNumberNegativeOrInfinity(seconds) || !Number.isInteger(seconds))
      return;

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
    setMinutesInput(convertSecondsToMinutes(seconds));
    setHoursMinutesSecondsInput(convertSecondsToHoursMinutesSeconds(seconds));
  };

  const handleMinutesInputChange = (value: string) => {
    setMinutesInput(value);
    const trimmedValue = value.trim();
    const minutes = trimmedValue.length === 0 ? 0 : Number(trimmedValue);

    if (isNumberNegativeOrInfinity(minutes)) return;

    const seconds: number = convertMinutesToSeconds(minutes);

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
    setSecondsInput(seconds.toString());
    setHoursMinutesSecondsInput(convertSecondsToHoursMinutesSeconds(seconds));
  };

  const convertMinutesToSeconds = (minutes: number): number => {
    return Math.floor(minutes * 60);
  };

  const convertHoursMinutesSecondsToSeconds = (
    hours: number,
    minutes: number,
    seconds: number
  ): number => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return timeInSeconds;
  };

  const handleHoursMinutesSecondsInputChange = (
    value: HoursMinutesSecondsInput
  ) => {
    setHoursMinutesSecondsInput(value);
    const hours = value.hours.trim().length === 0 ? 0 : Number(value.hours);
    const minutes =
      value.minutes.trim().length === 0 ? 0 : Number(value.minutes);
    const seconds =
      value.seconds.trim().length === 0 ? 0 : Number(value.seconds);

    if (
      isNumberNegativeOrInfinity(hours) ||
      isNumberNegativeOrInfinity(minutes) ||
      isNumberNegativeOrInfinity(seconds)
    )
      return;

    const timeInSeconds = convertHoursMinutesSecondsToSeconds(
      hours,
      minutes,
      seconds
    );

    setValue((prev) => ({ ...prev, time_in_seconds: timeInSeconds }));
    setSecondsInput(timeInSeconds.toString());
    setMinutesInput(convertSecondsToMinutes(timeInSeconds));
  };

  return (
    <div className="flex justify-between gap-2">
      <div className="flex">
        {inputType === "hhmmss" && (
          <div className="flex gap-1 w-full">
            <Input
              label="Hours"
              size="sm"
              variant="faded"
              isClearable
              value={hoursMinutesSecondsInput.hours}
              onValueChange={(value) =>
                handleHoursMinutesSecondsInputChange({
                  ...hoursMinutesSecondsInput,
                  hours: value,
                })
              }
              isInvalid={isHhmmssSecondsInputInvalid}
            />
            <Input
              label="Minutes"
              size="sm"
              variant="faded"
              isClearable
              value={hoursMinutesSecondsInput.minutes}
              onValueChange={(value) =>
                handleHoursMinutesSecondsInputChange({
                  ...hoursMinutesSecondsInput,
                  minutes: value,
                })
              }
              isInvalid={isHhmmssMinutesInputInvalid}
            />
            <Input
              label="Seconds"
              size="sm"
              variant="faded"
              isClearable
              value={hoursMinutesSecondsInput.seconds}
              onValueChange={(value) =>
                handleHoursMinutesSecondsInputChange({
                  ...hoursMinutesSecondsInput,
                  seconds: value,
                })
              }
              isInvalid={isHhmmssHoursInputInvalid}
            />
          </div>
        )}
        {inputType === "minutes" && (
          <Input
            label="Minutes"
            size="sm"
            variant="faded"
            isClearable
            value={minutesInput}
            onValueChange={(value) => handleMinutesInputChange(value)}
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
            onValueChange={(value) => handleSecondsInputChange(value)}
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
