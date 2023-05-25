import type Entry from "./entry";
import type Image from "./image";

export default class Album implements Entry {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public images: Image[],
    public children: Album[],
    public parent: Album | null,
    public cover: Image | null
  ) {
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
  parent: string | null;
  cover: string | null;
}
