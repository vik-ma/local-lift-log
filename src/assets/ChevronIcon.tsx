type ChevronIconProps = {
  color?: string;
  size?: number;
  direction?: "down" | "up" | "left";
};

export const ChevronIcon = ({ color, size, direction }: ChevronIconProps) => {
  return (
    <svg
      fill="none"
      height={size || 24}
      viewBox="0 0 24 24"
      width={size || 24}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform:
          direction === "up"
            ? "rotate(180deg)"
            : direction === "left"
            ? "rotate(90deg)"
            : undefined,
      }}
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
