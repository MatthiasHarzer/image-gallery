import type Image from "./gallery/image";
import type { Readable } from "svelte/store";
import { get, readable } from "svelte/store";
import type { TagConfig } from "./localConfig";
import { localConfig, SortMode } from "./localConfig";
import math from "random-seed";

interface LocalConfigLike {
  favoritesOnly: boolean,
  tagConfig: TagConfig,
  randomSeed: number,
  [key: string]: any
}

const sortImages = (images: Image[], config: LocalConfigLike): Image[] => {
  const sortMode = config.sortMode;
  switch (sortMode) {
    case SortMode.DATE_ASC:
      // @ts-ignore
      return images.sort((a, b) => a.timestamp - b.timestamp);
    case SortMode.DATE_DESC:
      // @ts-ignore
      return images.sort((a, b) => b.timestamp - a.timestamp);
    case SortMode.RANDOM:
      const rand = math.create(config.randomSeed);
      return images.sort(() => rand.random() - 0.5);
    default:
      return images;
  }
}

export const applyFiltersWithConfig = (images: Image[], config: LocalConfigLike): Image[] => {
  if (config.favoritesOnly) {
    images = images.filter(i => i.favorite);
  }

  if (config.tagConfig.enabled) {
    if (config.tagConfig.includedTags.length !== 0){
      images = images.filter(i => {
        const imageTags = i.tags.map(t => t.id);
        if (config.tagConfig.matchAll) {
          return config.tagConfig.includedTags
            .every(t => imageTags.includes(t));
        }else{
          return config.tagConfig.includedTags
            .some(t => imageTags.includes(t));
        }
      });
    }

    if (config.tagConfig.excludedTags.length !== 0){
      images = images.filter(i => {
        const imageTags = i.tags.map(t => t.id);
        return config.tagConfig.excludedTags.every(t => !imageTags.includes(t));
      });
    }
  }

  return sortImages(images, config);
}

export const applyFilters = (images: Readable<Image[]>): Readable<Image[]> => {
  return readable(applyFiltersWithConfig(get(images), get(localConfig)), set => images.subscribe(i => set(applyFiltersWithConfig(i, get(localConfig)))));
}
