import { Screen } from "./screen";
import { readable, writable } from "svelte/store";
import type { Readable } from "svelte/store";
import type { Writable } from "svelte/store";
import type Image from "./gallery/image";

interface LocalConfig {
  currentScreen: Screen;
  navPined: boolean;
  navOpen: boolean;
  includeSubAlbum: boolean;
  showFullscreenNav: boolean;
  favoritesOnly: boolean;
  currentImageViewStore: Writable<Readable<Image[]>>
}

const defaultLocalConfig: LocalConfig = {
  currentScreen: Screen.GALLERY,
  navPined: false,
  navOpen: false,
  includeSubAlbum: false,
  showFullscreenNav: false,
  favoritesOnly: false,
  currentImageViewStore: writable(readable([])),
}

const noCache = ["navOpen", "currentImageViewStore"];

const localConfigKey = "localConfig";

const createLocalConfig = () => {

  const localConfigString = localStorage.getItem(localConfigKey);
  const localConfig = localConfigString ? JSON.parse(localConfigString ?? null) : defaultLocalConfig;



  for (const key of Object.keys(defaultLocalConfig)) {
    if (!localConfig[key] || noCache.includes(key)) {
      localConfig[key] = defaultLocalConfig[key];
    }
  }

  const { set, subscribe, update } = writable<LocalConfig>(localConfig);

  subscribe((value) => {
    const filteredValue = Object.fromEntries(Object.entries(value).filter(([key]) => !noCache.includes(key)));
    localStorage.setItem(localConfigKey, JSON.stringify(filteredValue));
  });

  return {
    subscribe,
    set,
    update,
  }
}

export const localConfig: Writable<LocalConfig> = createLocalConfig();
