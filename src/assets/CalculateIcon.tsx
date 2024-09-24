type CalculateIconProps = {
  color?: string;
  size?: number;
};

export const CalculateIcon = ({ color, size }: CalculateIconProps) => {
  return (
    <svg
      width={size || "24px"}
      height={size || "24px"}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 8.5H10.5M13.75 14H17.25M13.75 16.5H17.25M6.75 15.25H10.75M8.75 17.25V13.25M14.1001 7L16.9285 9.82843M14.1001 9.82861L16.9285 7.00019M6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4Z"
        stroke={color || "#888"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
