import { Button } from "@nextui-org/react";
import { MinusIcon, PlusIcon } from "../assets";
import { CalculationListItem } from "../typings";

type PlusAndMinusButtonsProps = {
  trackingValue: string;
  updateValue: (
    key: string,
    isIncrease: boolean,
    calculationItem?: CalculationListItem,
    index?: number
  ) => void;
  isDecreaseDisabled: boolean;
  isIncreaseDisabled?: boolean;
  wrapAround?: boolean;
  calculationItem?: CalculationListItem;
  index?: number;
};

export const PlusAndMinusButtons = ({
  trackingValue,
  updateValue,
  isDecreaseDisabled,
  isIncreaseDisabled,
  wrapAround,
  calculationItem,
  index,
}: PlusAndMinusButtonsProps) => {
  return (
    <>
      <Button
        className={wrapAround ? "order-1" : ""}
        isIconOnly
        variant="flat"
        size="sm"
        onPress={() =>
          updateValue(trackingValue, false, calculationItem, index)
        }
        isDisabled={isDecreaseDisabled}
      >
        <MinusIcon />
      </Button>
      <Button
        className={wrapAround ? "order-3" : ""}
        isIconOnly
        variant="flat"
        size="sm"
        onPress={() => updateValue(trackingValue, true, calculationItem, index)}
        isDisabled={isIncreaseDisabled}
      >
        <PlusIcon />
      </Button>
    </>
  );
};
