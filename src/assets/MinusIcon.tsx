type MinusIconProps = {
  color?: string;
  size?: number;
};

export const MinusIcon = ({ color, size }: MinusIconProps) => {
  return (
    <svg
      width={size || 36}
      height={size || 36}
      viewBox="-4 -4 28.00 28.00"
      xmlns="http://www.w3.org/2000/svg"
      fill={color || "#808080"}
      stroke={color || "#808080"}
      strokeWidth="1"
    >
      <path
        fillRule="evenodd"
        d="M18 10a1 1 0 01-1 1H3a1 1 0 110-2h14a1 1 0 011 1z"
      ></path>
    </svg>
  );
};

export default MinusIcon;
