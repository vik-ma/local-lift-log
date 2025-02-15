import { useEffect } from "react";
import { UseFilterMinAndMaxValueInputsReturnType } from "../typings";
import { IsStringEmpty } from "../helpers";
import { Checkbox, Input } from "@heroui/react";

type FilterMinAndMaxValuesProps = {
  setFilterMinValue: React.Dispatch<React.SetStateAction<number | null>>;
  setFilterMaxValue: React.Dispatch<React.SetStateAction<number | null>>;
  label: string;
  useFilterMinAndMaxValueInputs: UseFilterMinAndMaxValueInputsReturnType;
  isSmall?: boolean;
  includeNullInMaxValues?: boolean;
  setIncludeNullInMaxValues?: React.Dispatch<React.SetStateAction<boolean>>;
  customIncludeNullCheckboxLabel?: string;
};

export const FilterMinAndMaxValues = ({
  setFilterMinValue,
  setFilterMaxValue,
  label,
  useFilterMinAndMaxValueInputs,
  isSmall,
  includeNullInMaxValues,
  setIncludeNullInMaxValues,
  customIncludeNullCheckboxLabel,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minInput, isMinInputInvalid]);

  useEffect(() => {
    if (isMaxInputInvalid) return;

    if (IsStringEmpty(maxInput)) {
      setFilterMaxValue(null);
    } else {
      setFilterMaxValue(Number(maxInput));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxInput, isMaxInputInvalid]);

  return (
    <div className="flex items-center gap-5">
      <div
        className={
          isSmall
            ? "w-[6rem] flex flex-col gap-0.5 whitespace-nowrap"
            : "w-[6.5rem] flex flex-col gap-0.5 whitespace-nowrap"
        }
      >
        <h4
          className={
            isMinInputInvalid
              ? "text-base font-semibold px-0.5 text-danger"
              : "text-base font-semibold px-0.5 text-default-500"
          }
        >
          Min {label}
        </h4>
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
        <h4
          className={
            isMaxInputInvalid || isMaxValueBelowMinValue
              ? "text-base font-semibold px-0.5 text-danger"
              : "text-base font-semibold px-0.5 text-default-500"
          }
        >
          Max {label}
        </h4>
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
      {includeNullInMaxValues !== undefined &&
        setIncludeNullInMaxValues !== undefined &&
        !IsStringEmpty(maxInput) && (
          <div className="w-[8rem]">
            <Checkbox
              className="hover:underline"
              classNames={{ label: "text-sm" }}
              color="primary"
              isSelected={includeNullInMaxValues}
              onValueChange={setIncludeNullInMaxValues}
            >
              {customIncludeNullCheckboxLabel !== undefined
                ? customIncludeNullCheckboxLabel
                : "Include entries with no values"}
            </Checkbox>
          </div>
        )}
    </div>
  );
};
