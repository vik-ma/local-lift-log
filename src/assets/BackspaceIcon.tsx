type BackspaceIconProps = {
  color?: string;
  size?: number;
};

export const BackspaceIcon = ({ color, size }: BackspaceIconProps) => {
  return (
    <svg
      width={size || 32}
      height={size || 32}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.91987 4.99994C7.33602 4.99994 6.78132 5.25507 6.40136 5.69836L2.11564 10.6984C1.47366 11.4473 1.47366 12.5525 2.11564 13.3015L6.40136 18.3015C6.78132 18.7448 7.33602 18.9999 7.91987 18.9999L19 18.9999C20.1046 18.9999 21 18.1045 21 16.9999L21 6.99994C21 5.89537 20.1046 4.99994 19 4.99994L7.91987 4.99994Z"
        stroke={color || "#999"}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
      <path
        d="M15.5 9.5L10.5 14.5"
        stroke={color || "#999"}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
      <path
        d="M10.5 9.5L15.5 14.5"
        stroke={color || "#999"}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  );
};
