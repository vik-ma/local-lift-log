type ChevronDownProps = {
  fill?: string;
  size?: number;
  height?: number;
  width?: number;
};

export const ChevronDownIcon = ({
  fill,
  size,
  height,
  width,
}: ChevronDownProps) => {
  return (
    <svg
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke={fill || "#999999"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  );
};

export default ChevronDownIcon;
