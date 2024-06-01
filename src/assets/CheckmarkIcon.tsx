type CheckmarkIconProps = {
  isChecked?: boolean;
  size?: number;
};

export const CheckmarkIcon = ({
  isChecked = true,
  size,
}: CheckmarkIconProps) => {
  return (
    <svg
      width={size || 26}
      height={size || 26}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="transition-fill-animation"
        fill={isChecked ? "#84cc16" : "#CCCCCC"}
        fillRule="evenodd"
        d={
          isChecked
            ? "M800,510a30,30,0,1,1,30-30A30,30,0,0,1,800,510Zm-16.986-23.235a3.484,3.484,0,0,1,0-4.9l1.766-1.756a3.185,3.185,0,0,1,4.574.051l3.12,3.237a1.592,1.592,0,0,0,2.311,0l15.9-16.39a3.187,3.187,0,0,1,4.6-.027L817,468.714a3.482,3.482,0,0,1,0,4.846l-21.109,21.451a3.185,3.185,0,0,1-4.552.03Z"
            : "M30,60A30,30,0,1,1,60,30,30.034,30.034,0,0,1,30,60ZM30,4.41A25.59,25.59,0,1,0,55.59,30,25.616,25.616,0,0,0,30,4.41Z"
        }
        id="checkmark"
        transform={isChecked ? "translate(-770 -450)" : ""}
      ></path>
    </svg>
  );
};

export default CheckmarkIcon;
