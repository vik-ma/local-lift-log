import { Button } from "@nextui-org/react";
import { MinusIcon, PlusIcon } from "../assets";
import { SetTrackingValues } from "../typings";

type PlusAndMinusButtonsProps = {
  trackingValue: SetTrackingValues;
  updateValue: (key: SetTrackingValues, isIncrease: boolean) => void;
  isDecreaseDisabled: boolean;
  isIncreaseDisabled?: boolean;
};

export const PlusAndMinusButtons = ({
  trackingValue,
  updateValue,
  isDecreaseDisabled,
  isIncreaseDisabled,
}: PlusAndMinusButtonsProps) => {
  return (
    <>
      <Button
        isIconOnly
        variant="flat"
        size="sm"
        onPress={() => updateValue(trackingValue, false)}
        isDisabled={isDecreaseDisabled}
      >
        <MinusIcon />
      </Button>
      <Button
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
