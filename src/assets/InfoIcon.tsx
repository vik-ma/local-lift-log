type InfoIconProps = {
  color?: string;
  size?: number;
};

export const InfoIcon = ({ color, size }: InfoIconProps) => {
  return (
    <svg
      width={size || 26}
      height={size || 26}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1050,360a30,30,0,1,1,30,30A30,30,0,0,1,1050,360Zm30,18a4,4,0,0,1-4-4V358a4,4,0,0,1,8,0v16A4,4,0,0,1,1080,378Zm0-36a4,4,0,1,1-4,4A4,4,0,0,1,1080,342Z"
        transform="translate(-1050 -330)"
        fill={color || "#606060"}
        fillRule="evenodd"
      ></path>
    </svg>
  );
};
