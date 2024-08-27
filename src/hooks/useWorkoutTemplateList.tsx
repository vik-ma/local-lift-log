import { WorkoutTemplateListItem } from "../typings";
import { useState, useEffect } from "react";
import { useDisclosure } from "@nextui-org/react";
import { GetWorkoutTemplates } from "../helpers";

export const useWorkoutTemplateList = () => {
  const [workoutTemplates, setWorkoutTemplates] = useState<
    WorkoutTemplateListItem[]
  >([]);

  const workoutTemplatesModal = useDisclosure();

  useEffect(() => {
    const getWorkoutTemplates = async () => {
      const workoutTemplates = await GetWorkoutTemplates();

      setWorkoutTemplates(workoutTemplates);
    };

    getWorkoutTemplates();
  }, []);

  return { workoutTemplatesModal, workoutTemplates };
};
