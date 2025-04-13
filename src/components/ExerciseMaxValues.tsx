import { FormatTimeInSecondsToHhmmssString } from "../helpers";
import { ExerciseMaxListValue } from "../typings";

type ExerciseMaxValuesProps = {
  maxMap: Map<number, ExerciseMaxListValue>;
  header1: string;
  suffix1: string;
  header2: string;
  suffix2: string;
  isSuffix1Reps?: boolean;
  isSuffix2Reps?: boolean;
  isSuffix2Time?: boolean;
};

export const ExerciseMaxValues = ({
  maxMap,
  header1,
  suffix1,
  header2,
  suffix2,
  isSuffix1Reps,
  isSuffix2Reps,
  isSuffix2Time,
}: ExerciseMaxValuesProps) => {
  return (
    <div className="flex flex-col text-foreground-900">
      <div className="flex flex-col">
        <div className="flex text-secondary text-lg leading-tight font-semibold border-b-1 border-foreground-400">
          <span className="w-[8rem] pl-[3px]">{header1}</span>
          <span className="w-[8rem] pl-0.5">{header2}</span>
          <span className="pl-0.5">First Completed</span>
        </div>
        <div className="flex flex-col text-sm">
          {Array.from(maxMap).map(([key, values]) => (
            <div
              key={key}
              className="flex py-1 odd:bg-default-50 even:bg-default-100/60 last:!rounded-b-lg"
            >
              <span className="w-[8rem] pl-1 truncate">
                <span className="font-semibold">{key} </span>
                {suffix1}
                {isSuffix1Reps && key !== 1 && "s"}
              </span>
              <span className="w-[8rem] font-semibold pl-[3px] truncate">
                {isSuffix2Time ? (
                  FormatTimeInSecondsToHhmmssString(values.value)
                ) : (
                  <>
                    {values.value}{" "}
                    <span className="font-normal">
                      {suffix2}
                      {isSuffix2Reps && values.value !== 1 && "s"}
                    </span>
                  </>
                )}
              </span>
              <span className="font-medium pl-[3px] text-stone-500">
                {values.formattedDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
