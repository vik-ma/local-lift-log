type DivideIconProps = {
  color?: string;
  size?: number;
};

export const DivideIcon = ({ color, size }: DivideIconProps) => {
  return (
    <svg
      width={size || 32}
      height={size || 32}
      viewBox="-3 0 19 19"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={color || "#999"}
        d="M12.711 9.182a1.03 1.03 0 0 1-1.03 1.03H1.319a1.03 1.03 0 1 1 0-2.059h10.364a1.03 1.03 0 0 1 1.029 1.03zM5.03 4.586a1.47 1.47 0 1 1 1.47 1.47 1.47 1.47 0 0 1-1.47-1.47zm2.94 9.193a1.47 1.47 0 1 1-1.47-1.47 1.47 1.47 0 0 1 1.47 1.47z"
      ></path>
    </svg>
  );
};
