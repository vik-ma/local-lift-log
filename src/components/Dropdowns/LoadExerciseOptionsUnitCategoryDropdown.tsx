import { Select, SelectItem } from "@heroui/react";
import { ChartDataCategory, ChartDataUnitCategory } from "../../typings";

type LoadExerciseOptionsUnitCategoryDropdownProps = {
  loadExerciseOptionsUnitCategory: ChartDataUnitCategory;
  setLoadExerciseOptionsUnitCategory: React.Dispatch<
    React.SetStateAction<ChartDataUnitCategory>
  >;
  chartDataAreas: ChartDataCategory[];
  loadExerciseOptionsUnitCategories: Set<ChartDataUnitCategory>;
};

export const LoadExerciseOptionsUnitCategoryDropdown = ({
  loadExerciseOptionsUnitCategory,
  setLoadExerciseOptionsUnitCategory,
  chartDataAreas,
  loadExerciseOptionsUnitCategories,
}: LoadExerciseOptionsUnitCategoryDropdownProps) => {
  return (
    <div className="w-[11.75rem]">
      <Select
        label="Chart Area Category"
        classNames={{
          trigger: "bg-amber-50 border-amber-200",
        }}
        size="sm"
        variant="faded"
        selectedKeys={
          loadExerciseOptionsUnitCategory !== undefined
            ? ([loadExerciseOptionsUnitCategory] as string[])
            : []
        }
        onChange={(e) =>
          setLoadExerciseOptionsUnitCategory(
            e.target.value as ChartDataUnitCategory
          )
        }
        disallowEmptySelection={chartDataAreas.length === 0}
      >
        {Array.from(loadExerciseOptionsUnitCategories).map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};
