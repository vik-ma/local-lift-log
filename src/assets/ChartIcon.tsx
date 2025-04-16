type ChartIconProps = {
  color?: string;
  size?: number;
};

export const ChartIcon = ({ color, size }: ChartIconProps) => {
  return (
    <svg
      height={size || 20}
      width={size || 20}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color || "#999"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 16 L12 11 L16 14 L19.55 6.89" fill="none" strokeWidth={2.5} />
      <path d="M3 3 L3 21 L21 21" fill="none" strokeWidth={2.8} />
      <path d="M19.95 6 L20.05 6" fill="none" strokeWidth={4.2} />
    </svg>
  );
};
