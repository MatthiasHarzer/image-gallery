import type Entry from "./entry";
import type Tag from "./tag";

export default class Image implements Entry {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public url: string,
    public tags: Tag[]
  ) {
  }
}

/**
 * Data structure for image data from Firestore.
 */
export interface ImageData {
  name: string;
  description: string;
  url: string;
  tags: string[];
}
