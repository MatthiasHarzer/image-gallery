import { Screen } from "./screen";
import { readable, writable } from "svelte/store";
import type { Readable } from "svelte/store";
import type { Writable } from "svelte/store";
import type Image from "./gallery/image";

export interface TagConfig {
  enabled: boolean;
  includedTags: string[];
  excludedTags: string[];
  matchAll: boolean;
}

export const defaultTagConfig: TagConfig = {
  enabled: false,
  includedTags: [],
  excludedTags: [],
  matchAll: false,
};

export enum SortMode {
  DATE_ASC = "DATE_ASC",
  DATE_DESC = "DATE_DESC",
  RANDOM = "RANDOM",
  AUTO = "AUTO",
}

interface LocalConfig {
  currentScreen: Screen;
  navPined: boolean;
  navOpen: boolean;
  includeSubAlbum: boolean;
  showFullscreenNav: boolean;
  favoritesOnly: boolean;
  currentImageViewStore: Writable<Readable<Image[]>>;
  tagConfig: TagConfig;
  sortMode: SortMode;
  randomSeed: number;
  autoDownloadImages: boolean;
}

const defaultLocalConfig: LocalConfig = {
  currentScreen: Screen.GALLERY,
  navPined: false,
  navOpen: false,
  includeSubAlbum: false,
  showFullscreenNav: false,
  favoritesOnly: false,
  currentImageViewStore: writable(readable([])),
  tagConfig: defaultTagConfig,
  sortMode: SortMode.DATE_ASC,
  randomSeed: 0,
  autoDownloadImages: false,
};

const noCache = ["navOpen", "currentImageViewStore"];

const localConfigKey = "localConfig";

const createLocalConfig = () => {
  const localConfigString = localStorage.getItem(localConfigKey);
  const localConfig: LocalConfig = localConfigString
    ? (JSON.parse(localConfigString ?? {}) as LocalConfig)
    : defaultLocalConfig;

  for (const key of Object.keys(defaultLocalConfig)) {
    // eslint-disable-next-line
    // @ts-ignore
    if (!localConfig[key] || noCache.includes(key)) {
      // eslint-disable-next-line
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      localConfig[key] = defaultLocalConfig[key];
    }
  }

  const { set, subscribe, update } = writable<LocalConfig>(localConfig);

  subscribe((value) => {
    const filteredValue = Object.fromEntries(
      Object.entries(value).filter(([key]) => !noCache.includes(key)),
    );
    localStorage.setItem(localConfigKey, JSON.stringify(filteredValue));
  });

  return {
    subscribe,
    set,
    update,
  };
};

export const localConfig: Writable<LocalConfig> = createLocalConfig();
