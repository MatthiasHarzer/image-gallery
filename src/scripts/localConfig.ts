import { Screen } from "./screen";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

interface LocalConfig {
  currentScreen: Screen;
  navPined: boolean;
  navOpen: boolean;
}

const defaultLocalConfig: LocalConfig = {
  currentScreen: Screen.GALLERY,
  navPined: false,
  navOpen: false,
}

const noCache = ["navOpen"];

const localConfigKey = "localConfig";

const createLocalConfig = () => {

  const localConfigString = localStorage.getItem(localConfigKey);
  const localConfig = localConfigString ? JSON.parse(localConfigString ?? null) : defaultLocalConfig;

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
