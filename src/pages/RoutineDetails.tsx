import { useParams } from "react-router-dom";
import { Routine } from "../typings";
import { useState, useMemo, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import { NotFound } from ".";
import Database from "tauri-plugin-sql-api";
import LoadingSpinner from "../components/LoadingSpinner";

export default function RoutineDetailsPage() {
  const { id } = useParams();
  const [routine, setRoutine] = useState<Routine>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newRoutineName, setNewRoutineName] = useState<string>("");
  const [newRoutineNote, setNewRoutineNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isNewRoutineNameInvalid = useMemo(() => {
    return (
      newRoutineName === null ||
      newRoutineName === undefined ||
      newRoutineName.trim().length === 0
    );
  }, [newRoutineName]);

  useEffect(() => {
    const getRoutine = async () => {
      try {
        const db = await Database.load(import.meta.env.VITE_DB);

        const result = await db.select<Routine[]>(
          "SELECT * FROM routines WHERE id = $1",
          [id]
        );

        if (result.length === 0) return;

        const currentRoutine: Routine = result[0];
        setRoutine(currentRoutine);
        setNewRoutineName(currentRoutine.name);
        setNewRoutineNote(currentRoutine.note ?? "");
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    getRoutine();
  }, [id]);

  const updateRoutineNoteAndName = async () => {
    if (isNewRoutineNameInvalid) return;

    try {
      if (routine === undefined) return;

      const noteToInsert: string | null =
        newRoutineNote.trim().length === 0 ? null : newRoutineNote;

      const db = await Database.load(import.meta.env.VITE_DB);

      await db.execute(
        "UPDATE routines SET name = $1, note = $2 WHERE id = $3",
        [newRoutineName, noteToInsert, routine.id]
      );

      setRoutine((prev) => ({
        ...prev!,
        name: newRoutineName,
        note: newRoutineNote,
      }));

      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (routine === undefined) return NotFound();

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex justify-center bg-neutral-900 px-6 py-4 rounded-xl">
            <h1 className="tracking-tight inline font-bold from-[#FF705B] to-[#FFB457] text-6xl bg-clip-text text-transparent bg-gradient-to-b">
              {routine?.name}
            </h1>
          </div>
          <div>
            <h2 className="text-xl px-1">
              <span className="font-semibold">Note:</span> {routine?.note}
            </h2>
          </div>
          {isEditing ? (
            <div className="flex flex-col justify-center gap-2">
              <Input
                value={newRoutineName}
                isInvalid={isNewRoutineNameInvalid}
                label="Name"
                errorMessage={isNewRoutineNameInvalid && "Name can't be empty"}
                variant="faded"
                onValueChange={(value) => setNewRoutineName(value)}
                isRequired
                isClearable
              />
              <Input
                value={newRoutineNote!}
                label="Note"
                variant="faded"
                onValueChange={(value) => setNewRoutineNote(value)}
                isClearable
              />
              <div className="flex justify-center gap-4">
                <Button color="danger" onPress={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button color="success" onPress={updateRoutineNoteAndName}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button color="primary" onPress={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
