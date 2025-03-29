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
        <div className="flex flex-col">
          <h3 className="font-semibold text-2xl text-center text-foreground-600">
            Exercise History
          </h3>
          {dateSetListMapReversed.size > 0 && (
            <span className="text-xs italic text-stone-500 text-center font-normal px-0.5">
              Click on set to go to workout
            </span>
          )}
          <div className="flex flex-col gap-1">
            {Array.from(dateSetListMapReversed).map(([date, setList]) => (
              <div key={date} className="flex flex-col text-foreground-600">
                <h4 className="font-semibold text-lg px-0.5">{date}</h4>
                <div className="flex flex-col">
                  {setList.map((set, index) => (
                    <div
                      key={set.id}
                      aria-label="Go to workout of set"
                      className="flex flex-col text-sm font-medium rounded-sm px-[3px] cursor-pointer hover:bg-violet-100"
                      onClick={() => navigate(`/workouts/${set.workout_id}`)}
                    >
                      <div className="flex">
                        <span className="text-foreground-500 w-[5rem] truncate">
                          Set {index + 1}
                        </span>
                        <div className="flex flex-wrap max-w-[20rem] font-normal text-indigo-800">
                          {set.is_tracking_weight === 1 && (
                            <div className="flex gap-1 w-[5rem]">
                              <span className="max-w-[4rem] truncate">
                                {set.weight}
                              </span>
                              <span>{set.weight_unit}</span>
                            </div>
                          )}
                          {set.is_tracking_reps === 1 && (
                            <div className="flex gap-1 w-[5rem]">
                              <span className="max-w-[4rem] truncate">
                                {set.reps}
                              </span>
                              <span>
                                rep
                                {set.reps !== 1 && "s"}
                              </span>
                            </div>
                          )}
                          {set.is_tracking_distance === 1 && (
                            <div className="flex gap-1 w-[5rem]">
                              <span className="max-w-[4rem] truncate">
                                {set.distance}
                              </span>
                              <span>{set.distance_unit}</span>
                            </div>
                          )}
                          {set.is_tracking_time === 1 && (
                            <div className="w-[5rem] truncate">
                              {FormatTimeInSecondsToHhmmssString(
                                set.time_in_seconds
                              )}
                            </div>
                          )}
                          {set.is_tracking_rpe === 1 && (
                            <div className="flex gap-1 w-[5rem]">
                              <span>RPE</span>
                              <span className="max-w-[2.5rem] truncate">
                                {set.rpe}
                              </span>
                            </div>
                          )}
                          {set.is_tracking_rir === 1 && (
                            <div className="flex gap-1 w-[5rem]">
                              <span className="max-w-[4rem] truncate">
                                {set.rir}
                              </span>
                              <span>RIR</span>
                            </div>
                          )}
                          {set.is_tracking_resistance_level === 1 && (
                            <div className="flex gap-1 w-[10rem]">
                              <span>Resistance Level</span>
                              <span className="max-w-[2.75rem] truncate">
                                {set.resistance_level}
                              </span>
                            </div>
                          )}
                          {set.is_tracking_partial_reps === 1 && (
                            <div className="flex gap-1 w-[10rem]">
                              <span className="max-w-[2.75rem] truncate">
                                {set.partial_reps}
                              </span>
                              <span>
                                partial rep
                                {set.partial_reps !== 1 && "s"}
                              </span>
                            </div>
                          )}
                          {set.is_tracking_user_weight === 1 && (
                            <div className="flex gap-1 w-[10rem]">
                              <span>Body Weight</span>
                              <span className="max-w-[3rem] truncate">
                                {set.user_weight}
                              </span>
                              <span>{set.user_weight_unit}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {set.comment !== null && (
                        <div className="flex font-normal text-xs text-stone-400">
                          <span className="w-[5rem] pl-0.5">Comment</span>
                          <span className="font-light max-w-[20rem] break-all">
                            {set.comment}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
