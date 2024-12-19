import { TimePeriodPropertyDropdown } from "..";
import { UserSettings } from "../../typings";

type TimePeriodListOptionsProps = {
  selectedTimePeriodProperties: Set<string>;
  setSelectedTimePeriodProperties: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  userSettings?: UserSettings;
  setUserSettings?: React.Dispatch<
    React.SetStateAction<UserSettings | undefined>
  >;
};

export const TimePeriodListOptions = ({
  selectedTimePeriodProperties,
  setSelectedTimePeriodProperties,
  userSettings,
  setUserSettings,
}: TimePeriodListOptionsProps) => {
  return (
    <div className="flex gap-1 pr-0.5">
      <TimePeriodPropertyDropdown
        selectedTimePeriodProperties={selectedTimePeriodProperties}
        setSelectedTimePeriodProperties={setSelectedTimePeriodProperties}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
      />
    </div>
  );
};
