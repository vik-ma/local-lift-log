import { ScrollShadow } from "@heroui/react";

type CalendarModalLegendProps<T> = {
  title: string;
  emptyListText: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

export const CalendarModalLegend = <T,>({
  title,
  emptyListText,
  items,
  renderItem,
}: CalendarModalLegendProps<T>) => {
  if (items.length === 0)
    return (
      <div className="w-[9.1rem] pt-0.5 text-sm font-medium text-center text-stone-400">
        {emptyListText}
      </div>
    );

  return (
    <div className="flex flex-col max-h-[274px]">
      <h4 className="font-medium text-sm">{title}</h4>
      <ScrollShadow className="w-[9.125rem]">
        {items.map(renderItem)}
      </ScrollShadow>
    </div>
  );
};
