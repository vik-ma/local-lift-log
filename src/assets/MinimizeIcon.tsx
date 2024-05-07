type MinimizeIconProps = {
  color?: string;
  size?: number;
};

export const MinimizeIcon = ({ color, size }: MinimizeIconProps) => {
  return (
    <svg
      width={size || 32}
      height={size || 32}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4,20l6-6M20,4l-6,6 M6 14 10 14 10 18 M18 10 14 10 14 6"
        stroke={color || "#555555"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></path>
    </svg>
  );
};

export default MinimizeIcon;
