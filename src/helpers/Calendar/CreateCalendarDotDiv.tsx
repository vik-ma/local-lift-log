export const CreateCalendarDotDiv = (color: string) => {
  const dot = document.createElement("div");

  dot.style.width = "6px";
  dot.style.height = "6px";
  dot.style.borderRadius = "50%";
  dot.style.backgroundColor = color;

  return dot;
};
