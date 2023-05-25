import type Entry from "./entry";
import type Tag from "./tag";


enum ImageState {
  uploading = "uploading",
  ready = "ready",
  error = "error",
  unknown = "unknown",
}

export default class Image implements Entry {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public url: string,
    public tags: Tag[],
    public state: ImageState = ImageState.ready,
  ) {
  }
}

/**
 * Data structure for image data from Firestore.
 */
export interface ImageData {
  id?: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  imageState: ImageState;
}
