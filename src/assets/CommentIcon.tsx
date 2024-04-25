type CommentIconProps = {
  size?: number;
};

export const CommentIcon = ({ size }: CommentIconProps) => {
  return (
    <svg
      fill="#808080"
      width={size || 20}
      height={size || 20}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M12.0867962,18 L6,21.8042476 L6,18 L4,18 C2.8954305,18 2,17.1045695 2,16 L2,4 C2,2.8954305 2.8954305,2 4,2 L20,2 C21.1045695,2 22,2.8954305 22,4 L22,16 C22,17.1045695 21.1045695,18 20,18 L12.0867962,18 Z M8,18.1957524 L11.5132038,16 L20,16 L20,4 L4,4 L4,16 L8,16 L8,18.1957524 Z M7,13 L7,11 L14,11 L14,13 L7,13 Z M7,9 L7,7 L16,7 L16,9 L7,9 Z"
      ></path>
    </svg>
  );
};

export default CommentIcon;
