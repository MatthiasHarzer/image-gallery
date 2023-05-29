import Album from "./gallery/album";
import { gallery } from "./firebase/firebaseManager";
import { readable } from "svelte/store";

const isSelfParent = (parent: Album, self: Album) => {
  if (parent == null) return false;
  return parent.id === self.id || isSelfParent(parent.parent, self);
}

const getRootAlbums = (albums: Album[]) => {
  if (albums == null) return [];
  return albums.filter(a => a.parent == null || isSelfParent(a.parent, a));
}

export const rootAlbum = readable(null, (set) => {
  return gallery.subscribe((gallery) => {
    set(Album.root(gallery.images, getRootAlbums(gallery.albumsWithFavorites)))
  });
});
