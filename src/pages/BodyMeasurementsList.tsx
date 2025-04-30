import { useEffect, useRef, useState } from "react";
import {
  BodyMeasurements,
  BodyMeasurementsOperationType,
  UserSettings,
} from "../typings";
import { BodyMeasurementsAccordions, LoadingSpinner } from "../components";
import { useMeasurementList } from "../hooks";
import { GetAllBodyMeasurements, GetUserSettings } from "../helpers";

export default function BodyMeasurementsList() {
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements[]>(
    []
  );
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [operationType, setOperationType] =
    useState<BodyMeasurementsOperationType>("add");

  const measurementList = useMeasurementList(true);

  const { measurementMap, isMeasurementListLoaded } = measurementList;

  const getBodyMeasurements = async (clockStyle: string) => {
    if (!isMeasurementListLoaded) return;

    const detailedBodyMeasurements = await GetAllBodyMeasurements(
      clockStyle,
      measurementMap.current
    );

    setBodyMeasurements(detailedBodyMeasurements);
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings) {
        setUserSettings(userSettings);
        getBodyMeasurements(userSettings.clock_style);
      }
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <>
      <div className="flex flex-col items-center gap-1.5">
        <BodyMeasurementsAccordions
          bodyMeasurements={bodyMeasurements}
          handleBodyMeasurementsAccordionClick={
            // TODO: ADD
            () => {}
          }
          measurementMap={measurementMap.current}
          handleBodyMeasurementsOptionSelection={
            // TODO: ADD
            () => {}
          }
          handleReassignMeasurement={
            // TODO: ADD
            () => {}
          }
        />
      </div>
    </>
  );
}
