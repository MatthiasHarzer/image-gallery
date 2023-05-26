import { writable } from "svelte/store";
import type Image from "./gallery/image";
import type { ReadWritable } from "./util/helperTypes";

interface FullscreenDialogConfig {
  images: ReadWritable<Image[]>;
  initialImageIdx: number;
  shown: boolean;
}

const emptyFullscreenDialogConfig: FullscreenDialogConfig = {
  images: writable([]),
  initialImageIdx: 0,
  shown: false,
}

const createFullscreenDialog = () => {

  const { subscribe, set } = writable(emptyFullscreenDialogConfig);

  return {
    subscribe,
    show: (images: ReadWritable<Image[]>, initialImageIdx: number) => {
      set({
        images,
        initialImageIdx,
        shown: true,
      });
    },
    hide: () => {
      set(emptyFullscreenDialogConfig);
    }
  }
}
export const fullscreenDialog = createFullscreenDialog();

