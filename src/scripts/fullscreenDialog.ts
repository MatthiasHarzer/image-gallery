import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type Image from "./gallery/image";
import type { ReadWritable } from "./util/helperTypes";
import type Album from "./gallery/album";

interface FullscreenDialogConfig {
  images: ReadWritable<Image[]>;
  initialImageIdx: number;
  album: ReadWritable<Album>;
  shown: boolean;
}

type WritableFullscreenDialog = Writable<FullscreenDialogConfig> & {
  show: (images: ReadWritable<Image[]>, initialImageIdx: number, album?: ReadWritable<Album>) => void;
  hide: () => void;
}

const emptyFullscreenDialogConfig: FullscreenDialogConfig = {
  images: writable([]),
  initialImageIdx: 0,
  album: writable(null),
  shown: false,
}


const createFullscreenDialog = (): WritableFullscreenDialog => {

  const { subscribe, set, update } = writable(emptyFullscreenDialogConfig);

  return {
    set,
    update,
    subscribe,
    show: (images: ReadWritable<Image[]>, initialImageIdx: number, album: ReadWritable<Album> = null) => {
      set({
        images,
        initialImageIdx,
        shown: true,
        album,
      });
    },
    hide: () => {
      set(emptyFullscreenDialogConfig);
    }
  }
}
export const fullscreenDialog: WritableFullscreenDialog = createFullscreenDialog();

