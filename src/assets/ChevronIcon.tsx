type ChevronIconProps = {
  color?: string;
  size?: number;
  height?: number;
  width?: number;
  isPointingUp?: boolean;
};

export const ChevronIcon = ({
  color,
  size,
  height,
  width,
  isPointingUp,
}: ChevronIconProps) => {
  return (
    <svg
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: isPointingUp ? "rotate(180deg)" : undefined }}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke={color || "#999999"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};

export default ChevronIcon;
