import { useNavigate, useParams } from "react-router-dom";
import {
  Exercise,
  ExerciseMaxListValue,
  UserSettings,
  WorkoutSet,
} from "../typings";
import { useState, useEffect, useRef } from "react";
import { Checkbox, useDisclosure } from "@heroui/react";
import {
  LoadingSpinner,
  ExerciseModal,
  DetailsHeader,
  ExerciseMaxValues,
  FavoriteButton,
} from "../components";
import {
  GetExerciseWithId,
  IsExerciseValid,
  ConvertEmptyStringToNull,
  UpdateExerciseValues,
  GetCompletedSetsWithExerciseId,
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  FormatDateToShortString,
  FormatTimeInSecondsToHhmmssString,
  CalculatePaceValue,
  GetSpeedUnitFromDistanceUnit,
  GetPaceUnitFromDistanceUnit,
  ConvertWeightValue,
  ConvertNumberToTwoDecimals,
  ConvertDistanceValue,
  CalculateSpeedValue,
  UpdateIsFavorite,
  UpdateUserSetting,
} from "../helpers";
import {
  useDefaultExercise,
  useValidateExerciseGroupStringPrimary,
  useValidateName,
  useDetailsHeaderOptionsMenu,
  useExerciseGroupDictionary,
  useMultiplierInputMap,
} from "../hooks";
import toast from "react-hot-toast";
import { TrophyIcon } from "../assets";

type ShowCheckboxType =
  | "warmup"
  | "multiset"
  | "pace"
  | "set-comments"
  | "workout-comments";

type TabPage = "history" | "weight" | "reps" | "distance" | "pace";

type PaceRecord = {
  pace: number;
  speed: number;
  distance: number;
  time: number;
  date: string;
};

export default function ExerciseDetails() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [distanceUnit, setDistanceUnit] = useState<string>("km");
  const [speedUnit, setSpeedUnit] = useState<string>("km/h");
  const [paceUnit, setPaceUnit] = useState<string>("min/km");
  const [dateSetListMap, setDateSetListMap] = useState<
    Map<string, WorkoutSet[]>
  >(new Map());
  const [showWarmups, setShowWarmups] = useState<boolean>(true);
  const [showMultisets, setShowMultisets] = useState<boolean>(true);
  const [showPace, setShowPace] = useState<boolean>(true);
  const [tabPage, setTabPage] = useState<TabPage>("history");
  const [showSetComments, setShowSetComments] = useState<boolean>(true);
  const [showWorkoutComments, setShowWorkoutComments] = useState<boolean>(true);

  const tabPages = useRef<string[][]>([["history", "Exercise History"]]);

  const defaultExercise = useDefaultExercise();

  const [editedExercise, setEditedExercise] =
    useState<Exercise>(defaultExercise);

  const exerciseModal = useDisclosure();

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const datesThatAreNotOnlyWarmups = useRef<Set<string>>(new Set());
  const datesThatAreNotOnlyMultisets = useRef<Set<string>>(new Set());

  const {
    multiplierInputMap,
    setMultiplierInputMap,
    multiplierInputInvaliditySet,
  } = useMultiplierInputMap();

  const isSetListLoaded = useRef<boolean>(false);

  const showWeightAndRepsTabs = useRef<boolean>(false);
  const showDistanceAndPaceTabs = useRef<boolean>(false);

  const showWarmupsCheckbox = useRef<boolean>(false);
  const showMultisetsCheckbox = useRef<boolean>(false);
  const showPaceCheckbox = useRef<boolean>(false);
  const showSetCommentsCheckbox = useRef<boolean>(false);
  const showWorkoutCommentsCheckbox = useRef<boolean>(false);

  const maxWeightMap = useRef<Map<number, ExerciseMaxListValue>>(new Map());
  const maxRepsMap = useRef<Map<number, ExerciseMaxListValue>>(new Map());
  const maxDistanceMap = useRef<Map<number, ExerciseMaxListValue>>(new Map());

  const maxWeights = useRef<Set<number>>(new Set());

  const paceRecords = useRef<PaceRecord[]>([]);

  const navigate = useNavigate();

  const dateWorkoutCommentMap = useRef<Map<string, Map<number, string>>>(
    new Map()
  );

  const getDateSetListMap = async (
    weightUnit: string,
    distanceUnit: string,
    speedUnit: string,
    paceUnit: string,
    locale: string
  ) => {
    const fullSetList = await GetCompletedSetsWithExerciseId(Number(id));

    if (fullSetList.length === 0) {
      isSetListLoaded.current = true;
      return;
    }

    const dateMap = new Map<string, WorkoutSet[]>();

    for (const set of fullSetList) {
      const date = FormatDateToShortString(
        new Date(set.time_completed!),
        locale
      );

      if (set.is_tracking_weight && set.is_tracking_reps) {
        const weight = ConvertNumberToTwoDecimals(
          ConvertWeightValue(set.weight, set.weight_unit, weightUnit)
        );

        const reps = set.reps;

        const areWeightAndRepsValid = weight >= 0 && reps > 0;

        if (areWeightAndRepsValid) {
          const doesWeightExistInMap = maxWeightMap.current.has(weight);

          // Add highest number of reps for specific weight to Map
          // If same amount of reps for weight, pick set which time_completed date occurred first
          if (
            (doesWeightExistInMap &&
              (reps > maxWeightMap.current.get(weight)!.value ||
                (reps === maxWeightMap.current.get(weight)!.value &&
                  new Date(set.time_completed!) <
                    new Date(maxWeightMap.current.get(weight)!.date!)))) ||
            !doesWeightExistInMap
          ) {
            maxWeightMap.current.set(weight, {
              value: reps,
              date: set.time_completed as string,
              formattedDate: date,
            });
          }

          const doesRepsExistInMap = maxRepsMap.current.has(reps);

          // Add highest weight for specific number of reps to Map, and all number of reps lower than it
          // If same amount of reps for weight, pick set which time_completed date occurred first
          for (let i = 1; i <= reps; i++) {
            if (
              (doesRepsExistInMap &&
                (weight > maxRepsMap.current.get(i)!.value ||
                  (weight === maxRepsMap.current.get(i)!.value &&
                    new Date(set.time_completed!) <
                      new Date(maxRepsMap.current.get(i)!.date!)))) ||
              !doesRepsExistInMap
            ) {
              maxRepsMap.current.set(i, {
                value: weight,
                date: set.time_completed as string,
                formattedDate: date,
                id: set.id,
              });
            }
          }

          if (!showWeightAndRepsTabs.current) {
            // Always insert Weight and Reps tabs before Distance and Pace
            tabPages.current.splice(
              1,
              0,
              ...[
                ["weight", "Weight Records"],
                ["reps", "Reps Records"],
              ]
            );

            showWeightAndRepsTabs.current = true;
          }
        }
      }

      if (set.is_tracking_distance && set.is_tracking_time) {
        const distance = ConvertNumberToTwoDecimals(
          ConvertDistanceValue(set.distance, set.distance_unit, distanceUnit)
        );

        const time = set.time_in_seconds;

        const areDistanceAndTimeValid = distance >= 0 && time > 0;

        if (areDistanceAndTimeValid) {
          const doesDistanceExistInMap = maxDistanceMap.current.has(distance);

          // Add lowest time for specific distance to Map
          // If same time for distance, pick set which time_completed date occurred first
          if (
            (doesDistanceExistInMap &&
              (time < maxDistanceMap.current.get(distance)!.value ||
                (time === maxDistanceMap.current.get(distance)!.value &&
                  new Date(set.time_completed!) <
                    new Date(maxDistanceMap.current.get(distance)!.date!)))) ||
            !doesDistanceExistInMap
          ) {
            maxDistanceMap.current.set(distance, {
              value: time,
              date: set.time_completed as string,
              formattedDate: date,
            });
          }

          const pace = CalculatePaceValue(
            set.distance,
            set.distance_unit,
            time,
            paceUnit
          );

          set.pace = pace;
          set.paceUnit = paceUnit;

          showPaceCheckbox.current = true;

          const speed = CalculateSpeedValue(
            set.distance,
            set.distance_unit,
            time,
            speedUnit
          );

          const paceRecord: PaceRecord = {
            pace: pace,
            speed: speed,
            distance: distance,
            time: time,
            date: date,
          };

          paceRecords.current.push(paceRecord);

          if (!showDistanceAndPaceTabs.current) {
            tabPages.current.push(
              ...[
                ["distance", "Distance Records"],
                ["pace", "Pace Records"],
              ]
            );

            showDistanceAndPaceTabs.current = true;
          }
        }
      }

      if (set.comment !== null) {
        showSetCommentsCheckbox.current = true;
      }

      if (set.is_warmup === 0) {
        datesThatAreNotOnlyWarmups.current.add(date);
      } else {
        showWarmupsCheckbox.current = true;
      }

      if (set.multiset_id === 0) {
        datesThatAreNotOnlyMultisets.current.add(date);
      } else {
        showMultisetsCheckbox.current = true;
      }

      if (dateMap.has(date)) {
        dateMap.get(date)!.push(set);
      } else {
        dateMap.set(date, [set]);
      }

      if (set.workout_comment !== null) {
        if (dateWorkoutCommentMap.current.has(date)) {
          // Append Workout comment to existing Map (value) for date
          dateWorkoutCommentMap.current
            .get(date)!
            .set(set.workout_id, set.workout_comment!);
        } else {
          // Create new Map (value) for date with Workout comment
          dateWorkoutCommentMap.current.set(
            date,
            new Map([[set.workout_id, set.workout_comment!]])
          );
        }

        showWorkoutCommentsCheckbox.current = true;
      }
    }

    maxWeightMap.current = new Map(
      [...maxWeightMap.current.entries()].sort((a, b) => b[0] - a[0])
    );

    maxRepsMap.current = new Map(
      [...maxRepsMap.current.entries()].sort((a, b) => b[0] - a[0])
    );

    maxDistanceMap.current = new Map(
      [...maxDistanceMap.current.entries()].sort((a, b) => b[0] - a[0])
    );

    paceRecords.current = paceRecords.current
      .sort((a, b) => a.pace - b.pace)
      .slice(0, 30);

    if (maxRepsMap.current.size > 0) {
      const highestKeyForValue = new Map<number, { key: number; id: number }>();

      for (const [key, value] of maxRepsMap.current) {
        const keyExists = highestKeyForValue.get(value.value);
        if (!keyExists || key > keyExists.key) {
          highestKeyForValue.set(value.value, { key: key, id: value.id! });
        }
      }

      const uniqueIds = new Set<number>();

      for (const { id } of highestKeyForValue.values()) {
        uniqueIds.add(id);
      }

      maxWeights.current = uniqueIds;
    }

    const sortedDateMapArray = Array.from(dateMap).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );

    setDateSetListMap(new Map([...sortedDateMapArray]));

    isSetListLoaded.current = true;
  };

  useEffect(() => {
    const getExercise = async () => {
      const currentExercise = await GetExerciseWithId(
        Number(id),
        exerciseGroupDictionary
      );

      setExercise(currentExercise);
      setEditedExercise(currentExercise);
    };

    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;
      const validUnits = GetValidatedUserSettingsUnits(userSettings);

      const weightUnit = validUnits.weightUnit;
      const distanceUnit = validUnits.distanceUnit;
      const speedUnit = GetSpeedUnitFromDistanceUnit(validUnits.distanceUnit);
      const paceUnit = GetPaceUnitFromDistanceUnit(validUnits.distanceUnit);

      setWeightUnit(weightUnit);
      setDistanceUnit(distanceUnit);
      setSpeedUnit(speedUnit);
      setPaceUnit(paceUnit);

      setShowWarmups(!!userSettings.show_warmups_in_exercise_details);
      setShowMultisets(!!userSettings.show_multisets_in_exercise_details);
      setShowPace(!!userSettings.show_pace_in_exercise_details);
      setShowSetComments(!!userSettings.show_set_comments_in_exercise_details);
      setShowWorkoutComments(
        !!userSettings.show_workout_comments_in_exercise_details
      );

      await getDateSetListMap(
        weightUnit,
        distanceUnit,
        speedUnit,
        paceUnit,
        userSettings.locale
      );

      setUserSettings(userSettings);
    };

    getExercise();
    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useDetailsHeaderOptions = useDetailsHeaderOptionsMenu("Exercise");

  const isEditedExerciseNameValid = useValidateName(editedExercise.name);

  const isExerciseGroupSetPrimaryStringValid =
    useValidateExerciseGroupStringPrimary(
      editedExercise.exercise_group_set_string_primary,
      exerciseGroupDictionary
    );

  const updateExercise = async () => {
    if (
      editedExercise === undefined ||
      !IsExerciseValid(
        isEditedExerciseNameValid,
        isExerciseGroupSetPrimaryStringValid
      )
    )
      return;

    editedExercise.note = ConvertEmptyStringToNull(editedExercise.note);

    const updatedExercise = await UpdateExerciseValues(
      editedExercise,
      multiplierInputMap,
      exerciseGroupDictionary
    );

    if (updatedExercise === undefined) return;

    setExercise(updatedExercise);

    exerciseModal.onClose();
    toast.success("Exercise Updated");
  };

  const toggleFavorite = async () => {
    if (exercise === undefined) return;

    const newFavoriteValue = exercise.is_favorite === 1 ? 0 : 1;

    const updatedExercise: Exercise = {
      ...exercise,
      is_favorite: newFavoriteValue,
    };

    const success = await UpdateIsFavorite(
      updatedExercise.id,
      "exercise",
      newFavoriteValue
    );

    if (!success) return;

    setExercise(updatedExercise);
  };

  const handleShowCheckboxChange = async (
    value: boolean,
    checkbox: ShowCheckboxType
  ) => {
    if (userSettings === undefined) return;

    const numValue = value ? 1 : 0;

    let column = "";

    switch (checkbox) {
      case "warmup":
        column = "show_warmups_in_exercise_details";
        setShowWarmups(value);
        break;
      case "multiset":
        column = "show_multisets_in_exercise_details";
        setShowMultisets(value);
        break;
      case "pace":
        column = "show_pace_in_exercise_details";
        setShowPace(value);
        break;
      case "set-comments":
        column = "show_set_comments_in_exercise_details";
        setShowSetComments(value);
        break;
      case "workout-comments":
        column = "show_workout_comments_in_exercise_details";
        setShowWorkoutComments(value);
        break;
      default:
        return;
    }

    await UpdateUserSetting(
      column as keyof UserSettings,
      numValue,
      userSettings,
      setUserSettings
    );
  };

  if (
    exercise === undefined ||
    userSettings === undefined ||
    !isSetListLoaded.current
  )
    return <LoadingSpinner />;

  return (
    <>
      <ExerciseModal
        exerciseModal={exerciseModal}
        exercise={editedExercise}
        setExercise={setEditedExercise}
        isExerciseNameValid={isEditedExerciseNameValid}
        isExerciseGroupSetPrimaryStringValid={
          isExerciseGroupSetPrimaryStringValid
        }
        exerciseGroupDictionary={exerciseGroupDictionary}
        multiplierInputMap={multiplierInputMap}
        setMultiplierInputMap={setMultiplierInputMap}
        multiplierInputInvaliditySet={multiplierInputInvaliditySet}
        buttonAction={updateExercise}
      />

      <div className="flex flex-col gap-2.5">
        <DetailsHeader
          header={exercise.name}
          subHeader={exercise.formattedGroupStringPrimary ?? ""}
          note={exercise.note}
          detailsType="Exercise"
          editButtonAction={() => exerciseModal.onOpen()}
          useDetailsHeaderOptions={useDetailsHeaderOptions}
          extraLeftButton1={
            <FavoriteButton
              name={exercise.name}
              isFavorite={!!exercise.is_favorite}
              item={exercise}
              toggleFavorite={toggleFavorite}
              isInDetailsHeader
            />
          }
        />
        <div className="flex flex-col justify-center">
          {dateSetListMap.size === 0 ? (
            <div className="text-stone-500 text-center text-lg pt-1">
              No sets completed for exercise
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div
                className="p-1 bg-default-100 rounded-xl"
                id="exercise-details-tabs"
              >
                {tabPages.current.map(([key, value], index) => (
                  <button
                    key={key}
                    className={
                      key === tabPage
                        ? "text-sm py-1.5 rounded-lg transition-colors duration-200 shadow-small bg-white text-black"
                        : "text-sm py-1.5 rounded-lg transition-colors duration-200 text-default-500 hover:opacity-50 focus:opacity-50"
                    }
                    id={`exercise-details-tab-${index}`}
                    onClick={() => setTabPage(key as TabPage)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {tabPage === "history" && (
                <div className="flex flex-col gap-1.5">
                  {(showWarmupsCheckbox.current ||
                    showMultisetsCheckbox.current ||
                    showPaceCheckbox.current ||
                    showSetCommentsCheckbox.current ||
                    showWorkoutCommentsCheckbox.current) && (
                    <div className="flex flex-wrap gap-x-6 gap-y-px">
                      {showWarmupsCheckbox.current && (
                        <Checkbox
                          className="hover:underline"
                          size="sm"
                          isSelected={showWarmups}
                          onValueChange={(value) =>
                            handleShowCheckboxChange(value, "warmup")
                          }
                        >
                          Show Warmups
                        </Checkbox>
                      )}
                      {showMultisetsCheckbox.current && (
                        <Checkbox
                          className="hover:underline"
                          size="sm"
                          isSelected={showMultisets}
                          onValueChange={(value) =>
                            handleShowCheckboxChange(value, "multiset")
                          }
                        >
                          Show Multisets
                        </Checkbox>
                      )}
                      {showPaceCheckbox.current && (
                        <Checkbox
                          className="hover:underline"
                          size="sm"
                          isSelected={showPace}
                          onValueChange={(value) =>
                            handleShowCheckboxChange(value, "pace")
                          }
                        >
                          Show Pace
                        </Checkbox>
                      )}
                      {showSetCommentsCheckbox.current && (
                        <Checkbox
                          className="hover:underline"
                          size="sm"
                          isSelected={showSetComments}
                          onValueChange={(value) =>
                            handleShowCheckboxChange(value, "set-comments")
                          }
                        >
                          Show Set Comments
                        </Checkbox>
                      )}
                      {showWorkoutCommentsCheckbox.current && (
                        <Checkbox
                          className="hover:underline"
                          size="sm"
                          isSelected={showWorkoutComments}
                          onValueChange={(value) =>
                            handleShowCheckboxChange(value, "workout-comments")
                          }
                        >
                          Show Workout Comments
                        </Checkbox>
                      )}
                    </div>
                  )}
                  <div className="relative flex flex-col gap-1.5">
                    <div className="absolute right-0 -top-px">
                      <span className="text-xs text-stone-500">
                        Click on set to go to workout
                      </span>
                    </div>
                    {Array.from(dateSetListMap).map(([date, setList]) => {
                      // Hide entire date if all sets in setList are warmups/multisets and if corresponding checkbox is unchecked
                      if (
                        !showMultisets &&
                        !datesThatAreNotOnlyMultisets.current.has(date)
                      ) {
                        return null;
                      }

                      if (
                        !showWarmups &&
                        !datesThatAreNotOnlyWarmups.current.has(date)
                      ) {
                        return null;
                      }

                      const workoutCommentMap =
                        dateWorkoutCommentMap.current.get(date);

                      let setNum = 0;

                      return (
                        <div
                          key={date}
                          className="flex flex-col divide-y divide-foreground-400 text-foreground-600"
                        >
                          <h4 className="font-semibold text-lg px-[3px] text-secondary leading-tight">
                            {date}
                          </h4>
                          <div className="flex flex-col pt-0.5">
                            {showWorkoutComments &&
                              workoutCommentMap !== undefined && (
                                <div className="flex flex-col">
                                  {Array.from(workoutCommentMap).map(
                                    ([id, comment]) => (
                                      <div
                                        key={id}
                                        className="px-[3px] leading-tight text-xs text-indigo-700 truncate"
                                      >
                                        {comment}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            {setList.map((set) => {
                              if (!showWarmups && set.is_warmup === 1)
                                return null;
                              if (!showMultisets && set.multiset_id > 0)
                                return null;

                              if (set.is_warmup === 0) setNum++;

                              return (
                                <button
                                  key={set.id}
                                  aria-label="Go to workout of set"
                                  className="flex flex-col text-left text-sm font-medium rounded-sm pl-1 cursor-pointer hover:bg-default-200 focus:bg-default-200"
                                  onClick={() =>
                                    navigate(`/workouts/${set.workout_id}`)
                                  }
                                >
                                  <div className="flex">
                                    {set.is_warmup === 1 ? (
                                      <span className="text-foreground-400 w-[4.75rem] truncate">
                                        Warmup
                                      </span>
                                    ) : (
                                      <div className="relative text-foreground-600 w-[4.75rem]">
                                        <div
                                          className={
                                            maxWeights.current.has(set.id)
                                              ? "truncate w-[3rem]"
                                              : "truncate w-[4.25rem]"
                                          }
                                        >
                                          Set {setNum}
                                        </div>
                                        {maxWeights.current.has(set.id) && (
                                          <div className="absolute right-2.5 top-px">
                                            <TrophyIcon />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    <div
                                      className={
                                        set.is_warmup === 1
                                          ? "flex flex-wrap max-w-[20rem] text-foreground-400"
                                          : "flex flex-wrap max-w-[20rem] text-foreground-900"
                                      }
                                    >
                                      {set.is_tracking_weight === 1 && (
                                        <div className="w-[5rem] font-normal">
                                          <span className="max-w-[4rem] truncate font-semibold">
                                            {set.weight}{" "}
                                          </span>
                                          {set.weight_unit}
                                        </div>
                                      )}
                                      {set.is_tracking_reps === 1 && (
                                        <div className="w-[5rem] font-normal">
                                          <span className="max-w-[4rem] truncate font-semibold">
                                            {set.reps}{" "}
                                          </span>
                                          rep
                                          {set.reps !== 1 && "s"}
                                        </div>
                                      )}
                                      {set.is_tracking_distance === 1 && (
                                        <div className="w-[5rem] font-normal">
                                          <span className="max-w-[4rem] truncate font-semibold">
                                            {set.distance}{" "}
                                          </span>
                                          {set.distance_unit}
                                        </div>
                                      )}
                                      {set.is_tracking_time === 1 && (
                                        <div className="w-[5rem] truncate font-semibold">
                                          {FormatTimeInSecondsToHhmmssString(
                                            set.time_in_seconds
                                          )}
                                        </div>
                                      )}
                                      {set.pace !== undefined && showPace && (
                                        <div className="w-[10rem] font-normal">
                                          (
                                          <span className="max-w-[4rem] truncate font-semibold">
                                            {set.pace}{" "}
                                          </span>
                                          {set.paceUnit})
                                        </div>
                                      )}
                                      {set.is_tracking_rpe === 1 && (
                                        <div className="w-[5rem] font-normal">
                                          RPE
                                          <span className="max-w-[2.5rem] truncate font-semibold">
                                            {" "}
                                            {set.rpe}
                                          </span>
                                        </div>
                                      )}
                                      {set.is_tracking_rir === 1 && (
                                        <div className="w-[5rem] font-normal">
                                          <span className="max-w-[4rem] truncate font-semibold">
                                            {set.rir}{" "}
                                          </span>
                                          RIR
                                        </div>
                                      )}
                                      {set.is_tracking_resistance_level ===
                                        1 && (
                                        <div className="w-[10rem] font-normal">
                                          Resistance Level
                                          <span className="max-w-[2.75rem] truncate font-semibold">
                                            {" "}
                                            {set.resistance_level}
                                          </span>
                                        </div>
                                      )}
                                      {set.is_tracking_partial_reps === 1 && (
                                        <div className="w-[10rem] font-normal">
                                          <span className="max-w-[2.75rem] truncate font-semibold">
                                            {set.partial_reps}{" "}
                                          </span>
                                          partial rep
                                          {set.partial_reps !== 1 && "s"}
                                        </div>
                                      )}
                                      {set.is_tracking_user_weight === 1 && (
                                        <div className="w-[10rem] font-normal">
                                          Body Weight
                                          <span className="max-w-[3rem] truncate font-semibold">
                                            {" "}
                                            {set.user_weight}{" "}
                                          </span>
                                          {set.user_weight_unit}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {(set.comment !== null ||
                                    set.multiset_id > 0) && (
                                    <div className="flex text-xs font-normal leading-none pb-0.5 text-yellow-600">
                                      <div className="w-[4.75rem]">
                                        {set.multiset_id > 0 && (
                                          <span className="text-slate-500">
                                            Multiset
                                          </span>
                                        )}
                                      </div>
                                      {set.comment !== null &&
                                        showSetComments && (
                                          <div className="max-w-[19.75rem] break-all">
                                            <span>{set.comment}</span>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {tabPage === "weight" && (
                <ExerciseMaxValues
                  maxMap={maxWeightMap.current}
                  header1="Weight"
                  suffix1={weightUnit}
                  header2="Max Reps"
                  suffix2="rep"
                  isSuffix2Reps
                />
              )}
              {tabPage === "reps" && (
                <ExerciseMaxValues
                  maxMap={maxRepsMap.current}
                  header1="Reps"
                  suffix1="rep"
                  header2="Max Weight"
                  suffix2={weightUnit}
                  isSuffix1Reps
                />
              )}
              {tabPage === "distance" && (
                <ExerciseMaxValues
                  maxMap={maxDistanceMap.current}
                  header1="Distance"
                  suffix1={distanceUnit}
                  header2="Min Time"
                  suffix2=""
                  isSuffix2Time
                />
              )}
              {tabPage === "pace" && (
                <div className="flex flex-col gap-1 text-foreground-900">
                  <span className="text-xs text-stone-500 pl-[1px]">
                    Top 30 Fastest Paces
                  </span>
                  <div className="flex flex-col">
                    <div className="flex text-secondary leading-tight font-semibold border-b-1 border-foreground-400">
                      <span className="w-[5.25rem] pl-[3px]">Pace</span>
                      <span className="w-[5.25rem] pl-[3px]">Speed</span>
                      <span className="w-[5rem] pl-[3px]">Distance</span>
                      <span className="w-[4.25em] pl-[3px]">Time</span>
                      <span className="pl-[3px]">Date</span>
                    </div>
                    <div className="flex flex-col text-xs leading-tight">
                      {paceRecords.current.map((paceRecord, index) => (
                        <div
                          key={index}
                          className="flex py-1 odd:bg-default-50 even:bg-default-100/60 last:!rounded-b-lg"
                        >
                          <span className="w-[5.25rem] pl-1 truncate">
                            <span className="font-semibold">
                              {paceRecord.pace}{" "}
                            </span>
                            {paceUnit}
                          </span>
                          <span className="w-[5.25rem] pl-1 truncate">
                            <span className="font-semibold">
                              {paceRecord.speed}{" "}
                            </span>
                            {speedUnit}
                          </span>
                          <span className="w-[5rem] pl-1 truncate">
                            <span className="font-semibold">
                              {paceRecord.distance}{" "}
                            </span>
                            {distanceUnit}
                          </span>
                          <span className="w-[4.25rem] pl-1 truncate font-semibold">
                            {FormatTimeInSecondsToHhmmssString(paceRecord.time)}
                          </span>
                          <span className="font-medium pl-1 text-stone-500">
                            {paceRecord.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
