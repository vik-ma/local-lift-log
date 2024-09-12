type DivideIconProps = {
  color?: string;
  size?: number;
};

export const DivideIcon = ({ color, size }: DivideIconProps) => {
  return (
    <svg
      width={size || 32}
      height={size || 32}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 12H20M13 6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6ZM13 18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18C11 17.4477 11.4477 17 12 17C12.5523 17 13 17.4477 13 18Z"
        stroke={color || "#999"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
