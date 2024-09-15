import { Button } from "@nextui-org/react";
import { MinusIcon, PlusIcon } from "../assets";

type PlusAndMinusButtonsProps = {
  trackingValue: string;
  updateValue: (key: string, isIncrease: boolean) => void;
  isDecreaseDisabled: boolean;
  isIncreaseDisabled?: boolean;
  wrapAround?: boolean;
};

export const PlusAndMinusButtons = ({
  trackingValue,
  updateValue,
  isDecreaseDisabled,
  isIncreaseDisabled,
  wrapAround,
}: PlusAndMinusButtonsProps) => {
  return (
    <>
      <Button
        className={wrapAround ? "order-1" : ""}
        isIconOnly
        variant="flat"
        size="sm"
        onPress={() => updateValue(trackingValue, false)}
        isDisabled={isDecreaseDisabled}
      >
        <MinusIcon />
      </Button>
      <Button
        className={wrapAround ? "order-3" : ""}
        isIconOnly
        variant="flat"
        size="sm"
        onPress={() => updateValue(trackingValue, true)}
        isDisabled={isIncreaseDisabled}
      >
        <PlusIcon />
      </Button>
    </>
  );
};