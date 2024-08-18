type MinusIconProps = {
  color?: string;
  size?: number;
};

export const MinusIcon = ({ color, size }: MinusIconProps) => {
  return (
    <svg
      width={size || 32}
      height={size || 32}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={color || "#999"}
        d="M6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12Z"
      ></path>
    </svg>
  );
};

export default MinusIcon;
