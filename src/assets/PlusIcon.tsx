type PlusIconProps = {
  color?: string;
  size?: number;
};

export const PlusIcon = ({ color, size }: PlusIconProps) => {
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
        d="M9 17a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3a1 1 0 10-2 0v6H3a1 1 0 000 2h6v6z"
      ></path>
    </svg>
  );
};

export default PlusIcon;
