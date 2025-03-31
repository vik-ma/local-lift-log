import { useNavigate, useParams } from "react-router-dom";
import { Exercise, UserSettings, WorkoutSet } from "../typings";
import { useState, useEffect, useRef } from "react";
import { useDisclosure } from "@heroui/react";
import { LoadingSpinner, ExerciseModal, DetailsHeader } from "../components";
import {
  GetExerciseWithId,
  UpdateExercise,
  IsExerciseValid,
  ConvertEmptyStringToNull,
  UpdateExerciseValues,
  GetCompletedSetsWithExerciseId,
  GetUserSettings,
  GetValidatedUserSettingsUnits,
  FormatDateToShortString,
  FormatTimeInSecondsToHhmmssString,
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

export default function ExerciseDetails() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise>();
  const [userSettings, setUserSettings] = useState<UserSettings>();
  const [dateSetListMap, setDateSetListMap] = useState<
    Map<string, WorkoutSet[]>
  >(new Map());
  const [dateSetListMapReversed, setDateSetListMapReversed] = useState<
    Map<string, WorkoutSet[]>
  >(new Map());
  const [weightUnit, setWeightUnit] = useState<string>("kg");
  const [distanceUnit, setDistanceUnit] = useState<string>("km");
  const [paceUnit, setPaceUnit] = useState<string>("km/h");

  const defaultExercise = useDefaultExercise();

  const [editedExercise, setEditedExercise] =
    useState<Exercise>(defaultExercise);

  const exerciseModal = useDisclosure();

  const exerciseGroupDictionary = useExerciseGroupDictionary();

  const {
    multiplierInputMap,
    setMultiplierInputMap,
    multiplierInputInvaliditySet,
  } = useMultiplierInputMap();

  const isSetListLoaded = useRef<boolean>(false);

  const navigate = useNavigate();

  const getDateSetListMap = async (
    weightUnit: string,
    distanceUnit: string,
    paceUnit: string,
    locale: string
  ) => {
    if (isSetListLoaded.current) return;

    const fullSetList = await GetCompletedSetsWithExerciseId(Number(id));

    if (fullSetList.length === 0) {
      isSetListLoaded.current = true;
      return;
    }

    const dateMap = new Map<string, WorkoutSet[]>();

    // const loadExerciseOptions = ValidLoadExerciseOptionsMap().keys();

    // const highestValueMap = new Map<ChartDataExerciseCategoryBase, number>();

    // const chartDataKeys: Set<ChartDataExerciseCategoryBase> = new Set();

    // for (const option of loadExerciseOptions) {
    //   highestValueMap.set(option, -1);
    //   chartDataKeys.add(option);
    // }

    for (const set of fullSetList) {
      const date = FormatDateToShortString(
        new Date(set.time_completed!),
        locale
      );

      if (dateMap.has(date)) {
        dateMap.get(date)!.push(set);
      } else {
        dateMap.set(date, [set]);
      }
    }

    const sortedDateMapArray = Array.from(dateMap).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    setDateSetListMap(new Map(sortedDateMapArray));
    setDateSetListMapReversed(new Map([...sortedDateMapArray].reverse()));

    isSetListLoaded.current = true;

    // TODO: ADD COMMENTMAP
    // TODO: ADD MULTISETMAP
    // TODO: ADD DEFAULT LOAD EXERCISE OPTIONS AND MAKE CHARTDATA ETC
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
      const paceUnit =
        distanceUnit === "km" || distanceUnit === "m" ? "km/h" : "mph";

      setWeightUnit(weightUnit);
      setDistanceUnit(distanceUnit);
      setPaceUnit(paceUnit);

      // TODO: ADD DEFAULT LOAD EXERCISE OPTIONS FOR CHART DATA
      await getDateSetListMap(
        weightUnit,
        distanceUnit,
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

    const success = await UpdateExercise(updatedExercise);

    if (!success) return;

    setExercise(updatedExercise);
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
      <div className="flex flex-col gap-4">
        <DetailsHeader
          header={exercise.name}
          subHeader={exercise.formattedGroupStringPrimary ?? ""}
          note={exercise.note}
          detailsType="Exercise"
          editButtonAction={() => exerciseModal.onOpen()}
          useDetailsHeaderOptions={useDetailsHeaderOptions}
          isFavorite={!!exercise.is_favorite}
          item={exercise}
          toggleFavorite={toggleFavorite}
        />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <h3 className="font-semibold text-2xl text-center leading-tight text-foreground-600">
              Exercise History
            </h3>
            {dateSetListMapReversed.size > 0 ? (
              <span className="text-xs text-stone-500 text-center font-normal">
                Click on set to go to workout
              </span>
            ) : (
              <span className="text-stone-500 text-center text-sm">
                No sets completed for exercise
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {Array.from(dateSetListMapReversed).map(([date, setList]) => {
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
                    {setList.map((set) => {
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
                              <span className="text-foreground-600 w-[4.75rem] truncate">
                                Set {setNum}
                              </span>
                            )}
                            <div
                              className={
                                set.is_warmup === 1
                                  ? "flex flex-wrap max-w-[20rem] text-foreground-400"
                                  : "flex flex-wrap max-w-[20rem] text-foreground-900"
                              }
                            >
                              {set.is_tracking_weight === 1 && (
                                <div className="flex gap-1 w-[5rem]">
                                  <span className="max-w-[4rem] truncate font-semibold">
                                    {set.weight}
                                  </span>
                                  <span className="font-normal">
                                    {set.weight_unit}
                                  </span>
                                </div>
                              )}
                              {set.is_tracking_reps === 1 && (
                                <div className="flex gap-1 w-[5rem]">
                                  <span className="max-w-[4rem] truncate font-semibold">
                                    {set.reps}
                                  </span>
                                  <span className="font-normal">
                                    rep
                                    {set.reps !== 1 && "s"}
                                  </span>
                                </div>
                              )}
                              {set.is_tracking_distance === 1 && (
                                <div className="flex gap-1 w-[5rem]">
                                  <span className="max-w-[4rem] truncate font-semibold">
                                    {set.distance}
                                  </span>
                                  <span className="font-normal">
                                    {set.distance_unit}
                                  </span>
                                </div>
                              )}
                              {set.is_tracking_time === 1 && (
                                <div className="w-[5rem] truncate font-semibold">
                                  {FormatTimeInSecondsToHhmmssString(
                                    set.time_in_seconds
                                  )}
                                </div>
                              )}
                              {set.is_tracking_rpe === 1 && (
                                <div className="flex gap-1 w-[5rem]">
                                  <span className="font-normal">RPE</span>
                                  <span className="max-w-[2.5rem] truncate font-semibold">
                                    {set.rpe}
                                  </span>
                                </div>
                              )}
                              {set.is_tracking_rir === 1 && (
                                <div className="flex gap-1 w-[5rem]">
                                  <span className="max-w-[4rem] truncate font-semibold">
                                    {set.rir}
                                  </span>
                                  <span className="font-normal">RIR</span>
                                </div>
                              )}
                              {set.is_tracking_resistance_level === 1 && (
                                <div className="flex gap-1 w-[10rem]">
                                  <span className="font-normal">
                                    Resistance Level
                                  </span>
                                  <span className="max-w-[2.75rem] truncate font-semibold">
                                    {set.resistance_level}
                                  </span>
                                </div>
                              )}
                              {set.is_tracking_partial_reps === 1 && (
                                <div className="flex gap-1 w-[10rem]">
                                  <span className="max-w-[2.75rem] truncate font-semibold">
                                    {set.partial_reps}
                                  </span>
                                  <span className="font-normal">
                                    partial rep
                                    {set.partial_reps !== 1 && "s"}
                                  </span>
                                </div>
                              )}
                              {set.is_tracking_user_weight === 1 && (
                                <div className="flex gap-1 w-[10rem]">
                                  <span className="font-normal">
                                    Body Weight
                                  </span>
                                  <span className="max-w-[3rem] truncate font-semibold">
                                    {set.user_weight}
                                  </span>
                                  <span className="font-normal">
                                    {set.user_weight_unit}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {(set.comment !== null || set.multiset_id > 0) && (
                            <div className="flex text-xs font-normal leading-none pb-0.5 text-yellow-600">
                              <div className="w-[4.75rem]">
                                {set.multiset_id > 0 && (
                                  <span className="text-slate-500">
                                    Multiset
                                  </span>
                                )}
                              </div>
                              <div className="max-w-[19.75rem] break-all">
                                {set.comment !== null && (
                                  <span>{set.comment}</span>
                                )}
                              </div>
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
      </div>
    </>
  );
}
