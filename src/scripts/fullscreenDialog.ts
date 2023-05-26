import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type Image from "./gallery/image";

interface FullscreenDialogConfig {
  images: Image[];
  currentImage: Image;
  shown: boolean;
}

const emptyFullscreenDialogConfig: FullscreenDialogConfig = {
  images: [],
  currentImage: null,
  shown: false,
}

const createFullscreenDialog = () => {

  const { subscribe, set } = writable(emptyFullscreenDialogConfig);

  return {
    subscribe,
    show: (images: Image[], currentImage: Image) => {
      set({
        images,
        currentImage,
        shown: true,
      });
    },
    hide: () => {
      set(emptyFullscreenDialogConfig);
    }
  }
}
export const fullscreenDialog = createFullscreenDialog();

