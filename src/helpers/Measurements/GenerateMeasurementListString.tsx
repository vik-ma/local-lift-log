import { UserMeasurement } from "../../typings"

export const GenerateMeasurementListString = (measurementList: UserMeasurement[]) => {
    const measurementListString = measurementList.map((obj) => obj.name).join(",");

    return measurementListString;
}