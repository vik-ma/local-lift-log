type ChevronIconProps = {
  color?: string;
  size?: number;
  direction?: "down" | "up" | "left";
};

export const ChevronIcon = ({ color, size, direction }: ChevronIconProps) => {
  return (
    <svg
      fill={color || "#999999"}
      height={size || 24}
      viewBox="0 0 32 32"
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
        d="M16.003 18.626l7.081-7.081L25 13.46l-8.997 8.998-9.003-9 1.917-1.916z"
        stroke={color || "#999999"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={0}
      />
    </svg>
  );
};