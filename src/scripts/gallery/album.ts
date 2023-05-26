import type Entry from "./entry";
import type Image from "./image";

export default class Album implements Entry {
  constructor(public id: string, public name: string, public description: string, public images: Image[], public children: Album[], public parent: Album | null, public cover: Image | null) {
  }

  public static dummy(): Album {
    return new Album(null, "", "", [], [], null, null);
  }

  public static root(images: Image[], albums: Album[]): Album {
    return new Album(null, "root", "", images, albums, null, null);
  }

  public modifyWith(album: Album): Album {
    this.name = album.name;
    this.description = album.description;
    this.images = album.images;
    this.children = album.children;
    this.parent = album.parent;
    this.cover = album.cover;
    return this;
  }
}

/**
 * Data structure for album data from Firestore.
 */
export interface AlbumData {
  id?: string;
  name: string;
  description: string;
  images: string[];
  children: string[];
  cover: string | null;
  parent: string | null;
}
