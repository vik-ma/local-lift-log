import { Button } from "@heroui/react";
import { FavoriteIcon } from "../assets";

type FavoriteButtonProps<T> = {
  name: string;
  isFavorite: boolean;
  item: T;
  toggleFavorite: (item: T, key?: string) => void;
  isInDetailsHeader?: boolean;
};

export const FavoriteButton = <T,>({
  name,
  isFavorite,
  item,
  toggleFavorite,
  isInDetailsHeader,
}: FavoriteButtonProps<T>) => {
  return (
    <Button
      aria-label={
        isFavorite ? `Unset Favorite For ${name}` : `Set Favorite For ${name}`
      }
      isIconOnly
      className="z-1"
      color={isFavorite ? "primary" : "default"}
      size={isInDetailsHeader ? "sm" : "md"}
      radius={isInDetailsHeader ? "sm" : "lg"}
      variant="light"
      onPress={() => toggleFavorite(item)}
    >
      <FavoriteIcon
        isChecked={isFavorite}
        size={isInDetailsHeader ? 28 : 32}
        isInDetailsHeader={isInDetailsHeader}
      />
    </Button>
  );
};
