import type { Writable } from "svelte/store";
import { get, writable } from "svelte/store";
import type Image from "./gallery/image";
import type { ReadWritable } from "./util/helperTypes";
import type Album from "./gallery/album";
import { route } from "./routeManager";
import { rootAlbum } from "./rootAlbum";
import { localConfig } from "./localConfig";
import { gallery } from "./firebase/firebaseManager";
import { Screen } from "./screen";

interface FullscreenDialogConfig {
  images: ReadWritable<Image[]>;
  initialImageIdx: number;
  album: ReadWritable<Album>;
  shown: boolean;
}


const emptyFullscreenDialogConfig: FullscreenDialogConfig = {
  images: writable([]),
  initialImageIdx: 0,
  album: writable(null),
  shown: false,
}


const createFullscreenDialog = (): Writable<FullscreenDialogConfig> => {

  const { subscribe, set, update } = writable(emptyFullscreenDialogConfig);

  const hide = () => {
    set(emptyFullscreenDialogConfig);
  }

  const show = (images: ReadWritable<Image[]>, initialImageIdx: number, album: ReadWritable<Album> = null) => {
    if (get(fullscreenDialog).shown) return;
    set({
      images,
      initialImageIdx,
      shown: true,
      album,
    });
  }

  route.subscribe(r => {
    if (r.fullscreenImage == null) return hide();

    const album = r.albums.length > 0 && r.screen == Screen.ALBUMS ? r.albums[r.albums.length - 1] : get(rootAlbum);

    const includeSubAlbums = get(localConfig).includeSubAlbum;

    const images = album.id != null
      ? get(gallery).listener.getAlbumImageStore(album, includeSubAlbums)
      : get(gallery).listener.galleryImageStore;

    if (get(images).length === 0) return hide();

    const initialImageIdx = get(images).findIndex(i => i.id === r.fullscreenImage.id);

    if (initialImageIdx === -1) return hide();

    show(images, initialImageIdx, get(gallery).listener.getAlbumStore(album));
  });

  return {
    set,
    update,
    subscribe,
  }
}
export const fullscreenDialog: Writable<FullscreenDialogConfig> = createFullscreenDialog();

