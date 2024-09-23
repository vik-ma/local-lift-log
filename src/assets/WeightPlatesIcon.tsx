type WeightPlatesIconProps = {
  isChecked: boolean;
  size?: number;
};

export const WeightPlatesIcon = ({
  isChecked,
  size,
}: WeightPlatesIconProps) => {
  return (
    <svg height={size || 32} width={size || 32} viewBox="0 0 512 512">
      {isChecked ? (
        <>
          <path
            fill="#ab8418"
            d="M490.667,192h-64c0-35.355-28.645-64-64-64c-8.333,0-16.284,1.608-23.584,4.503c-7.388-27.183-32.221-47.17-61.749-47.17 c-8.333,0-16.284,1.608-23.584,4.503c-7.388-27.183-32.221-47.17-61.749-47.17c-35.355,0-64,28.645-64,64V192H21.333 C9.551,192,0,201.551,0,213.333v85.333C0,310.449,9.551,320,21.333,320H128v85.333c0,35.355,28.645,64,64,64 c29.528,0,54.361-19.987,61.749-47.17c7.3,2.895,15.251,4.503,23.584,4.503c29.528,0,54.361-19.987,61.749-47.17 c7.3,2.895,15.251,4.503,23.584,4.503c35.355,0,64-28.645,64-64h64c11.782,0,21.333-9.551,21.333-21.333v-85.333 C512,201.551,502.449,192,490.667,192z"
          />
          <path
            fill="#f7bf24"
            d="M42.667,277.333v-42.667H128v42.667H42.667z M213.333,405.333 c0,11.791-9.542,21.333-21.333,21.333s-21.333-9.542-21.333-21.333V298.667v-85.333V106.667c0-11.791,9.542-21.333,21.333-21.333 s21.333,9.542,21.333,21.333v42.667v213.333V405.333z M298.667,362.667c0,11.791-9.542,21.333-21.333,21.333 S256,374.458,256,362.667V149.333c0-11.791,9.542-21.333,21.333-21.333s21.333,9.542,21.333,21.333V192v128V362.667z M384,320 c0,11.791-9.542,21.333-21.333,21.333s-21.333-9.542-21.333-21.333V192c0-11.791,9.542-21.333,21.333-21.333S384,180.209,384,192 v21.333v85.333V320z M469.333,277.333h-42.667v-42.667h42.667V277.333z"
          />
        </>
      ) : (
        <path
          fill="#808080"
          d="M490.667,192h-64c0-35.355-28.645-64-64-64c-8.333,0-16.284,1.608-23.584,4.503c-7.388-27.183-32.221-47.17-61.749-47.17 c-8.333,0-16.284,1.608-23.584,4.503c-7.388-27.183-32.221-47.17-61.749-47.17c-35.355,0-64,28.645-64,64V192H21.333 C9.551,192,0,201.551,0,213.333v85.333C0,310.449,9.551,320,21.333,320H128v85.333c0,35.355,28.645,64,64,64 c29.528,0,54.361-19.987,61.749-47.17c7.3,2.895,15.251,4.503,23.584,4.503c29.528,0,54.361-19.987,61.749-47.17 c7.3,2.895,15.251,4.503,23.584,4.503c35.355,0,64-28.645,64-64h64c11.782,0,21.333-9.551,21.333-21.333v-85.333 C512,201.551,502.449,192,490.667,192z M42.667,277.333v-42.667H128v42.667H42.667z M213.333,405.333 c0,11.791-9.542,21.333-21.333,21.333s-21.333-9.542-21.333-21.333V298.667v-85.333V106.667c0-11.791,9.542-21.333,21.333-21.333 s21.333,9.542,21.333,21.333v42.667v213.333V405.333z M298.667,362.667c0,11.791-9.542,21.333-21.333,21.333 S256,374.458,256,362.667V149.333c0-11.791,9.542-21.333,21.333-21.333s21.333,9.542,21.333,21.333V192v128V362.667z M384,320 c0,11.791-9.542,21.333-21.333,21.333s-21.333-9.542-21.333-21.333V192c0-11.791,9.542-21.333,21.333-21.333S384,180.209,384,192 v21.333v85.333V320z M469.333,277.333h-42.667v-42.667h42.667V277.333z"
        />
      )}
    </svg>
  );
};
