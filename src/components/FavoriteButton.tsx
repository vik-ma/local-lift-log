import { Button } from "@nextui-org/react";
import { FavoriteIcon } from "../assets";

type FavoriteButtonProps<T> = {
  name: string;
  isFavorite: boolean;
  item: T;
  toggleFavorite: (item: T, key?: string) => void;
};

export const FavoriteButton = <T,>({
  name,
  isFavorite,
  item,
  toggleFavorite,
}: FavoriteButtonProps<T>) => {
  return (
    <Button
      aria-label={
        isFavorite ? `Unset Favorite For ${name}` : `Set Favorite For ${name}`
      }
      isIconOnly
      className="z-1"
      color={isFavorite ? "primary" : "default"}
      radius="lg"
      variant="light"
      onPress={() => toggleFavorite(item)}
    >
      <FavoriteIcon isChecked={isFavorite} size={32} />
    </Button>
  );
};
