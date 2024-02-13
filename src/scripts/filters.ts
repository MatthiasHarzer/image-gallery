import type Image from "./gallery/image";
import type { Readable } from "svelte/store";
import { get, readable } from "svelte/store";
import type { TagConfig } from "./localConfig";
import { localConfig, SortMode } from "./localConfig";
import math from "random-seed";
import type Album from "./gallery/album";

interface LocalConfigLike {
  favoritesOnly: boolean;
  tagConfig: TagConfig;
  randomSeed: number;

  [key: string]: any;
}

const sortImagesByAlbums = (images: Image[], albums: Album[]): Image[] => {
  const forcedAlbums = albums.filter((album) => album.forceSort);
  if (forcedAlbums.length === 0) return images;

  let forcedImages = [];

  for (const album of forcedAlbums) {
    const albumImages = album.images.filter((image) => images.includes(image));
    albumImages.sort((a, b) => {
      const aIndex = album.images.findIndex((image) => image === a);
      const bIndex = album.images.findIndex((image) => image === b);
      return aIndex - bIndex;
    });
    forcedImages = [...forcedImages, ...albumImages];
  }

  const unforcedImages = images.filter(
    (image) => !forcedImages.includes(image),
  );

  return [...unforcedImages, ...forcedImages];
};

const sortByMode = (images: Image[], config: LocalConfigLike): Image[] => {
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
    case SortMode.AUTO:
    default:
      return images;
  }
};

const sortImages = (
  images: Image[],
  config: LocalConfigLike,
  album: Album | null = null,
): Image[] => {
  const albums = album != null ? [album, ...album.getAllSubAlbums()] : [];
  const sorted = sortByMode(images, config);

  return sortImagesByAlbums(sorted, albums);
};

export const applyFiltersWithConfig = (
  images: Image[],
  config: LocalConfigLike,
  album: Album | null = null,
): Image[] => {
  if (config.favoritesOnly) {
    images = images.filter((i) => i.favorite);
  }

  const albumTags = album?.getTags()?.map((i) => i.id) ?? [];
  let includedTags = config.tagConfig.includedTags;
  let excludedTags = config.tagConfig.excludedTags;

  if (albumTags.length > 0) {
    includedTags = includedTags.filter((t) => albumTags.includes(t));
    excludedTags = excludedTags.filter((t) => albumTags.includes(t));
  }

  if (config.tagConfig.enabled) {
    if (includedTags.length !== 0) {
      images = images.filter((i) => {
        const imageTags = i.tags.map((t) => t.id);
        if (config.tagConfig.matchAll) {
          return includedTags.every((t) => imageTags.includes(t));
        } else {
          return includedTags.some((t) => imageTags.includes(t));
        }
      });
    }

    if (excludedTags.length !== 0) {
      images = images.filter((i) => {
        const imageTags = i.tags.map((t) => t.id);
        return excludedTags.every((t) => !imageTags.includes(t));
      });
    }
  }

  return sortImages(images, config, album);
};

export const applyFilters = (
  images: Readable<Image[]>,
  _album: Readable<Album> | null = null,
): Readable<Image[]> => {
  const album = _album ?? readable(null, () => {});

  return readable(
    applyFiltersWithConfig(get(images), get(localConfig)),
    (set) =>
      images.subscribe((i) => {
        set(applyFiltersWithConfig(i, get(localConfig), get(album)));
      }),
  );
};
