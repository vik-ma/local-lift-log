import { Spinner } from "@nextui-org/react";

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center py-8">
      <Spinner size="lg" />
    </div>
  );
};

export default LoadingSpinner;
