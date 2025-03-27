type FavoriteIconProps = {
  isChecked: boolean;
  size?: number;
  isInDetailsHeader?: boolean;
};

export const FavoriteIcon = ({
  isChecked,
  size,
  isInDetailsHeader,
}: FavoriteIconProps) => {
  return (
    <svg
      height={size || 25}
      width={size || 25}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="transition-fill-animation"
        d={
          isChecked
            ? "M12 2.5a1 1 0 0 1 .894.553l2.58 5.158 5.67.824a1 1 0 0 1 .554 1.706l-4.127 4.024.928 5.674a1 1 0 0 1-1.455 1.044L12 18.807l-5.044 2.676a1 1 0 0 1-1.455-1.044l.928-5.674-4.127-4.024a1 1 0 0 1 .554-1.706l5.67-.824 2.58-5.158A1 1 0 0 1 12 2.5z"
            : "M12 2.5a1 1 0 0 1 .894.553l2.58 5.158 5.67.824a1 1 0 0 1 .554 1.706l-4.127 4.024.928 5.674a1 1 0 0 1-1.455 1.044L12 18.807l-5.044 2.676a1 1 0 0 1-1.455-1.044l.928-5.674-4.127-4.024a1 1 0 0 1 .554-1.706l5.67-.824 2.58-5.158A1 1 0 0 1 12 2.5zm0 3.236l-1.918 3.836a1 1 0 0 1-.75.543l-4.184.608 3.05 2.973a1 1 0 0 1 .289.878L7.8 18.771l3.731-1.98a1 1 0 0 1 .938 0l3.731 1.98-.687-4.197a1 1 0 0 1 .289-.877l3.05-2.974-4.183-.608a1 1 0 0 1-.75-.543L12 5.736z"
        }
        fill={
          isChecked && isInDetailsHeader
            ? "#e4b20c"
            : !isChecked && isInDetailsHeader
            ? "#808080"
            : isChecked
            ? "#f7bf24"
            : "#808080"
        }
      ></path>
    </svg>
  );
};
