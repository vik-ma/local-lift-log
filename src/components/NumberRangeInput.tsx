import { Input } from "@nextui-org/react";
import { NumberRange, NumberRangeInvalidityMap } from "../typings";
import { IsStringInvalidNumber } from "../helpers";

type NumberRangeInputProps = {
  numberRange: NumberRange;
  setNumberRange: React.Dispatch<React.SetStateAction<NumberRange>>;
  label: string;
  numberRangeInvalidityMap: NumberRangeInvalidityMap;
};

export const NumberRangeInput = ({
  numberRange,
  setNumberRange,
  label,
  numberRangeInvalidityMap,
}: NumberRangeInputProps) => {
  const handleInputChange = (value: string, isStart: boolean) => {
    const updatedNumberRange = { ...numberRange };

    if (isStart) {
      updatedNumberRange.startInput = value;
      if (!IsStringInvalidNumber(value)) {
        updatedNumberRange.start = Number(value);
      }
    } else {
      updatedNumberRange.endInput = value;
      if (!IsStringInvalidNumber(value)) {
        updatedNumberRange.end = Number(value);
      }
    }

    setNumberRange(updatedNumberRange);
  };

  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold text-lg px-0.5">{label}</h3>
      <div className="flex gap-3 px-0.5">
        <div className="flex flex-col">
          <span className="font-medium text-sm px-0.5">From</span>
          <Input
            className="w-[6.5rem]"
            value={numberRange.startInput}
            aria-label={`${label} From Input`}
            variant="faded"
            labelPlacement="outside"
            onValueChange={(value) => handleInputChange(value, true)}
            isInvalid={numberRangeInvalidityMap.start}
            isClearable
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm px-0.5">To</span>
          <Input
            className="w-[6.5rem]"
            value={numberRange.endInput}
            aria-label={`${label} To Input`}
            variant="faded"
            labelPlacement="outside"
            onValueChange={(value) => handleInputChange(value, false)}
            isInvalid={numberRangeInvalidityMap.end}
            isClearable
          />
        </div>
      </div>
    </div>
  );
};
