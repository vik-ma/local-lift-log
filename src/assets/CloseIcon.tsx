type CloseIconProps = {
  color?: string;
  size?: number;
};

export const CloseIcon = ({ color, size }: CloseIconProps) => {
  return (
    <svg
      fill="none"
      width={size || 32}
      height={size || 32}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 9.00004L9 15M15 15L9 9.00004M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke={color || "#666666"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

export default CloseIcon;
