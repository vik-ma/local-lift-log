import { Input } from "@nextui-org/react";
import { NumberRange } from "../typings";

type NumberRangeInputProps = {
  numberRange: NumberRange;
  setNumberRange: React.Dispatch<React.SetStateAction<NumberRange>>;
  label: string;
};

export const NumberRangeInput = ({
  numberRange,
  setNumberRange,
  label,
}: NumberRangeInputProps) => {
  const handleInputChange = (value: string, isStart: boolean) => {
    const updatedNumberRange = { ...numberRange };

    if (isStart) {
      updatedNumberRange.startInput = value;
    } else {
      updatedNumberRange.endInput = value;
    }

    setNumberRange(updatedNumberRange);
  };

  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold text-lg px-0.5">{label}</h3>
      <div className="flex gap-3">
        <div className="flex flex-col px-0.5">
          <span className="font-medium text-sm px-0.5">From</span>
          <Input
            className="w-[5.75rem]"
            value={numberRange.startInput}
            aria-label={`${label} From Input`}
            size="sm"
            variant="faded"
            labelPlacement="outside"
            onValueChange={(value) => handleInputChange(value, true)}
            //   TODO: ADD
            //   isInvalid={false}
            isClearable
          />
        </div>
        <div className="flex flex-col px-0.5">
          <span className="font-medium text-sm px-0.5">To</span>
          <Input
            className="w-[5.75rem]"
            value={numberRange.endInput}
            aria-label={`${label} To Input`}
            size="sm"
            variant="faded"
            labelPlacement="outside"
            onValueChange={(value) => handleInputChange(value, false)}
            //   TODO: ADD
            //   isInvalid={false}
            isClearable
          />
        </div>
      </div>
    </div>
  );
};
