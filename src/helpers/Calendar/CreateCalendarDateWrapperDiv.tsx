export const CreateCalendarDateWrapperDiv = (
  date: string,
  wrapperIdString: string,
  wrapper: HTMLDivElement,
  parentCell: HTMLElement,
  dateWrapperCellMap: Map<string, HTMLDivElement>
) => {
  wrapper.id = wrapperIdString;
  wrapper.style.position = "absolute";
  wrapper.style.width = "100%";
  wrapper.style.display = "flex";
  wrapper.style.flexWrap = "wrap-reverse";
  wrapper.style.justifyContent = "center";
  wrapper.style.gap = "1px";
  wrapper.style.bottom = "4px";
  wrapper.style.pointerEvents = "none";

  parentCell.style.position = "relative";

  parentCell.appendChild(wrapper);

  dateWrapperCellMap.set(date, wrapper);
};
