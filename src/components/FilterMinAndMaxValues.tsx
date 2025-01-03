import { useEffect } from "react";
import { UseFilterMinAndMaxValueInputsReturnType } from "../typings";
import { IsStringEmpty } from "../helpers";
import { Input } from "@nextui-org/react";

type FilterMinAndMaxValuesProps = {
  setFilterMinValue: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxValue: React.Dispatch<React.SetStateAction<number | null>>;
  label: string;
  useFilterMinAndMaxValueInputs: UseFilterMinAndMaxValueInputsReturnType;
  isSmall?: boolean;
};

export const FilterMinAndMaxValues = ({
  setFilterMinValue,
  setFilterMaxValue,
  label,
  useFilterMinAndMaxValueInputs,
  isSmall,
}: FilterMinAndMaxValuesProps) => {
  const {
    minInput,
    setMinInput,
    maxInput,
    setMaxInput,
    isMinInputInvalid,
    isMaxInputInvalid,
    isMaxValueBelowMinValue,
  } = useFilterMinAndMaxValueInputs;

  useEffect(() => {
    if (isMinInputInvalid) return;

    if (IsStringEmpty(minInput)) {
      setFilterMinValue(null);
    } else {
      setFilterMinValue(Number(minInput));
    }
  }, [minInput, isMinInputInvalid, setFilterMinValue]);

  useEffect(() => {
    if (isMaxInputInvalid) return;

    if (IsStringEmpty(maxInput)) {
      setFilterMaxValue(null);
    } else {
      setFilterMaxValue(Number(maxInput));
    }
  }, [maxInput, isMaxInputInvalid, setFilterMaxValue]);

  return (
    <div className="flex gap-5">
      <div
        className={
          isSmall
            ? "w-[6rem] flex flex-col gap-0.5"
            : "w-[6.5rem] flex flex-col gap-0.5"
        }
      >
        <h3
          className={
            isMinInputInvalid
              ? "text-base font-semibold px-0.5 text-danger whitespace-nowrap"
              : "text-base font-semibold px-0.5 whitespace-nowrap"
          }
        >
          Min {label}
        </h3>
        <Input
          aria-label={`Min ${label} Input`}
          className="h-[3.5rem]"
          value={minInput}
          variant="faded"
          onValueChange={setMinInput}
          isInvalid={isMinInputInvalid}
          isClearable
        />
      </div>
      <div
        className={
          isSmall
            ? "w-[6rem] flex flex-col gap-0.5 whitespace-nowrap"
            : "w-[6.5rem] flex flex-col gap-0.5 whitespace-nowrap"
        }
      >
        <h3
          className={
            isMaxInputInvalid || isMaxValueBelowMinValue
              ? "text-base font-semibold px-0.5 text-danger"
              : "text-base font-semibold px-0.5"
          }
        >
          Max {label}
        </h3>
        <Input
          aria-label={`Max ${label} Input`}
          className="h-[3.5rem]"
          value={maxInput}
          variant="faded"
          onValueChange={setMaxInput}
          isInvalid={isMaxInputInvalid || isMaxValueBelowMinValue}
          isClearable
          errorMessage={
            isMaxValueBelowMinValue && (
              <span className="text-nowrap">Max Value is below Min Value</span>
            )
          }
        />
      </div>
    </div>
  );
};
