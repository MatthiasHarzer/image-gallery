import type Image from "./gallery/image";
import type { Readable } from "svelte/store";
import { get, readable } from "svelte/store";
import { localConfig } from "./localConfig";

export const applyFilters = (images: Readable<Image[]>): Readable<Image[]>  => {

  const favoritesOnly = get(localConfig).favoritesOnly;

  if (favoritesOnly) {
    images = readable(get(images).filter(i => i.favorite), set => {
      return images.subscribe(i => set(i.filter(i => i.favorite)));
    });
  }


  return images;
}
