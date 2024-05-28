import { Input, Select, SelectItem } from "@nextui-org/react";
import { WorkoutSet } from "../typings";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ConvertNumberToTwoDecimals,
  IsNumberNegativeOrInfinity,
  IsStringEmpty,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove59,
} from "../helpers";

type TimeInputProps = {
  value: WorkoutSet;
  setValue: React.Dispatch<React.SetStateAction<WorkoutSet>>;
  defaultTimeInput: string;
  setIsInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  time_input_behavior_hhmmss: string;
  time_input_behavior_mmss: string;
};

type HhmmssInput = {
  hours: string;
  minutes: string;
  seconds: string;
};

type MmssInput = {
  minutes: string;
  seconds: string;
};

type TimeInputBehaviorMapType = {
  [key: string]: number;
};

export const TimeInput = ({
  value,
  setValue,
  defaultTimeInput,
  setIsInvalid,
  time_input_behavior_hhmmss,
  time_input_behavior_mmss,
}: TimeInputProps) => {
  const [inputType, setInputType] = useState<string>(defaultTimeInput);

  const timeInputBehaviorMap: TimeInputBehaviorMapType = useMemo(() => {
    return { first: 1, second: 2, third: 3, never: 0 };
  }, []);

  const convertSecondsToMinutes = (seconds: number): string => {
    if (seconds === 0) return "";
    const minutes = seconds / 60;
    const minutesTrimmed = ConvertNumberToTwoDecimals(minutes);
    return minutesTrimmed.toString();
  };

  const convertSecondsToHhmmss = (seconds: number): HhmmssInput => {
    if (seconds === 0) return { seconds: "", minutes: "", hours: "" };

    const hours = Math.floor(seconds / 3600);
    const remainingSecondsAfterHours = seconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const remainingSeconds = remainingSecondsAfterHours % 60;

    const hhmmssInput: HhmmssInput = {
      hours: hours === 0 ? "" : hours.toString(),
      minutes: minutes === 0 ? "" : minutes.toString(),
      seconds: remainingSeconds === 0 ? "" : remainingSeconds.toString(),
    };
    return hhmmssInput;
  };

  const convertSecondsToMmss = (seconds: number): MmssInput => {
    if (seconds === 0) return { seconds: "", minutes: "" };

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const mmssInput: MmssInput = {
      minutes: minutes === 0 ? "" : minutes.toString(),
      seconds: remainingSeconds === 0 ? "" : remainingSeconds.toString(),
    };
    return mmssInput;
  };

  const {
    secondsDefaultValue,
    minutesDefaultValue,
    hhmmssDefaultValue,
    mmssDefaultValue,
  } = useMemo(() => {
    const secondsDefaultValue: string =
      value.time_in_seconds === 0 ? "" : value.time_in_seconds.toString();
    const minutesDefaultValue: string = convertSecondsToMinutes(
      value.time_in_seconds
    );
    const hhmmssDefaultValue: HhmmssInput = convertSecondsToHhmmss(
      value.time_in_seconds
    );
    const mmssDefaultValue: MmssInput = convertSecondsToMmss(
      value.time_in_seconds
    );

    return {
      secondsDefaultValue,
      minutesDefaultValue,
      hhmmssDefaultValue,
      mmssDefaultValue,
    };
  }, [value.time_in_seconds]);

  const [secondsInput, setSecondsInput] = useState<string>(secondsDefaultValue);
  const [minutesInput, setMinutesInput] = useState<string>(minutesDefaultValue);
  const [hhmmssInput, setHhmmssInput] =
    useState<HhmmssInput>(hhmmssDefaultValue);
  const [mmssInput, setMmssInput] = useState<MmssInput>(mmssDefaultValue);

  const isSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(secondsInput);
  }, [secondsInput]);

  const isMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidNumber(minutesInput);
  }, [minutesInput]);

  const isHhmmssSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(hhmmssInput.seconds);
  }, [hhmmssInput.seconds]);

  const isHhmmssMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(hhmmssInput.minutes);
  }, [hhmmssInput.minutes]);

  const isHhmmssHoursInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(hhmmssInput.hours);
  }, [hhmmssInput.hours]);

  const isMmssMinutesInputInvalid = useMemo(() => {
    return IsStringInvalidInteger(mmssInput.minutes);
  }, [mmssInput.minutes]);

  const isMmssSecondsInputInvalid = useMemo(() => {
    return IsStringInvalidNumberOrAbove59(mmssInput.seconds);
  }, [mmssInput.seconds]);

  useEffect(() => {
    if (
      isSecondsInputInvalid ||
      isMinutesInputInvalid ||
      isHhmmssHoursInputInvalid ||
      isHhmmssMinutesInputInvalid ||
      isHhmmssSecondsInputInvalid
    ) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
  }, [
    isSecondsInputInvalid,
    isMinutesInputInvalid,
    isHhmmssHoursInputInvalid,
    isHhmmssMinutesInputInvalid,
    isHhmmssSecondsInputInvalid,
    setIsInvalid,
  ]);

  const handleSecondsInputChange = (value: string) => {
    setSecondsInput(value);
    const seconds = IsStringEmpty(value) ? 0 : Number(value);

    if (IsNumberNegativeOrInfinity(seconds) || !Number.isInteger(seconds))
      return;

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
  };

  const handleMinutesInputChange = (value: string) => {
    setMinutesInput(value);
    const minutes = IsStringEmpty(value) ? 0 : Number(value);

    if (IsNumberNegativeOrInfinity(minutes)) return;

    const seconds: number = convertMinutesToSeconds(minutes);

    setValue((prev) => ({ ...prev, time_in_seconds: seconds }));
  };

  const convertMinutesToSeconds = (minutes: number): number => {
    return Math.floor(minutes * 60);
  };

  const convertHhmmssToSeconds = (
    hours: number,
    minutes: number,
    seconds: number
  ): number => {
    const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return timeInSeconds;
  };

  const convertMmssToSeconds = (minutes: number, seconds: number): number => {
    const timeInSeconds = minutes * 60 + seconds;
    return timeInSeconds;
  };

  const handleHhmmssInputChange = (value: HhmmssInput) => {
    // Don't allow more than 2 characters in minutes and seconds input fields
    if (value.minutes.length > 2 || value.seconds.length > 2) return;

    setHhmmssInput(value);
    const hours = IsStringEmpty(value.hours) ? 0 : Number(value.hours);
    const minutes = IsStringEmpty(value.minutes) ? 0 : Number(value.minutes);
    const seconds = IsStringEmpty(value.seconds) ? 0 : Number(value.seconds);

    if (
      IsNumberNegativeOrInfinity(hours) ||
      IsNumberNegativeOrInfinity(minutes) ||
      IsNumberNegativeOrInfinity(seconds)
    )
      return;

    const timeInSeconds = convertHhmmssToSeconds(hours, minutes, seconds);

    setValue((prev) => ({ ...prev, time_in_seconds: timeInSeconds }));

    // Don't move focus
    if (time_input_behavior_hhmmss === "never") return;

    // Move focus to HH:MM:SS Minutes Input field after typing in a number in Hours field
    if (
      value.hours.length === timeInputBehaviorMap[time_input_behavior_hhmmss] &&
      hhmmssMinutesInput.current &&
      document.activeElement === hhmmssHoursInput.current
    ) {
      hhmmssMinutesInput.current.focus();
      return;
    }

    // Move focus to HH:MM:SS Seconds Input field after typing in 2 numbers in Minutes field
    if (
      value.minutes.length === 2 &&
      hhmmssSecondsInput.current &&
      document.activeElement === hhmmssMinutesInput.current
    ) {
      hhmmssSecondsInput.current.focus();
    }
  };

  const handleMmssInputChange = (value: MmssInput) => {
    // Don't allow more than 2 characters in seconds input field
    if (value.seconds.length > 2) return;

    setMmssInput(value);
    const minutes = IsStringEmpty(value.minutes) ? 0 : Number(value.minutes);
    const seconds = IsStringEmpty(value.seconds) ? 0 : Number(value.seconds);

    if (
      IsNumberNegativeOrInfinity(minutes) ||
      IsNumberNegativeOrInfinity(seconds)
    )
      return;

    const timeInSeconds = convertMmssToSeconds(minutes, seconds);

    setValue((prev) => ({ ...prev, time_in_seconds: timeInSeconds }));

    // Don't move focus
    if (time_input_behavior_mmss === "never") return;

    // Move focus to MM:SS Seconds Input field after typing in 3 numbers in Minutes field
    if (
      value.minutes.length === timeInputBehaviorMap[time_input_behavior_mmss] &&
      mmssSecondsInput.current &&
      document.activeElement === mmssMinutesInput.current
    ) {
      mmssSecondsInput.current.focus();
    }
  };

  useEffect(() => {
    setSecondsInput(
      value.time_in_seconds === 0 ? "" : value.time_in_seconds.toString()
    );
    setMinutesInput(convertSecondsToMinutes(value.time_in_seconds));
    setMmssInput(convertSecondsToMmss(value.time_in_seconds));
    setHhmmssInput(convertSecondsToHhmmss(value.time_in_seconds));
  }, [value.time_in_seconds]);

  const hhmmssHoursInput = useRef<HTMLInputElement>(null);
  const hhmmssMinutesInput = useRef<HTMLInputElement>(null);
  const hhmmssSecondsInput = useRef<HTMLInputElement>(null);
  const mmssMinutesInput = useRef<HTMLInputElement>(null);
  const mmssSecondsInput = useRef<HTMLInputElement>(null);

  return (
    <div className="flex justify-between gap-1">
      <div className="flex">
        {inputType === "hhmmss" && (
          <div className="flex gap-1 w-full">
            <Input
              aria-label="Hours Input Field"
              variant="faded"
              isClearable
              value={hhmmssInput.hours}
              onValueChange={(value) =>
                handleHhmmssInputChange({
                  ...hhmmssInput,
                  hours: value,
                })
              }
              isInvalid={isHhmmssHoursInputInvalid}
              ref={hhmmssHoursInput}
            />
            <Input
              aria-label="Minutes Input Field"
              variant="faded"
              isClearable
              value={hhmmssInput.minutes}
              onValueChange={(value) =>
                handleHhmmssInputChange({
                  ...hhmmssInput,
                  minutes: value,
                })
              }
              isInvalid={isHhmmssMinutesInputInvalid}
              ref={hhmmssMinutesInput}
            />
            <Input
              aria-label="Seconds Input Field"
              variant="faded"
              isClearable
              value={hhmmssInput.seconds}
              onValueChange={(value) =>
                handleHhmmssInputChange({
                  ...hhmmssInput,
                  seconds: value,
                })
              }
              isInvalid={isHhmmssSecondsInputInvalid}
              ref={hhmmssSecondsInput}
            />
          </div>
        )}
        {inputType === "mmss" && (
          <div className="flex gap-1 w-full">
            <Input
              aria-label="Minutes Input Field"
              variant="faded"
              isClearable
              value={mmssInput.minutes}
              onValueChange={(value) =>
                handleMmssInputChange({
                  ...mmssInput,
                  minutes: value,
                })
              }
              isInvalid={isMmssMinutesInputInvalid}
              ref={mmssMinutesInput}
            />
            <Input
              aria-label="Seconds Input Field"
              variant="faded"
              isClearable
              value={mmssInput.seconds}
              onValueChange={(value) =>
                handleMmssInputChange({
                  ...mmssInput,
                  seconds: value,
                })
              }
              isInvalid={isMmssSecondsInputInvalid}
              ref={mmssSecondsInput}
            />
          </div>
        )}
        {inputType === "minutes" && (
          <Input
            aria-label="Minutes Input Field"
            variant="faded"
            isClearable
            value={minutesInput}
            onValueChange={(value) => handleMinutesInputChange(value)}
            isInvalid={isMinutesInputInvalid}
          />
        )}
        {inputType === "seconds" && (
          <Input
            aria-label="Seconds Input Field"
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
          aria-label="Time Input Type Dropdown List"
          className="w-32"
          variant="faded"
          selectedKeys={[inputType]}
          onChange={(e) => setInputType(e.target.value)}
          disallowEmptySelection
        >
          <SelectItem key="hhmmss" value="hhmmss">
            HH:MM:SS
          </SelectItem>
          <SelectItem key="mmss" value="mmss">
            MM:SS
          </SelectItem>
          <SelectItem key="minutes" value="minutes">
            Minutes
          </SelectItem>
          <SelectItem key="seconds" value="seconds">
            Seconds
          </SelectItem>
        </Select>
      </div>
    </div>
  );
};

export default TimeInput;
