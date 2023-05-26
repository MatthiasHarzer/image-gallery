import type Entry from "./entry";
import type Tag from "./tag";


export enum ImageState {
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
    public width: number,
    public height: number,
    public favorite: boolean = false,
  ) {
  }

  public modifyWith(image: Image): Image {
    this.name = image.name;
    this.description = image.description;
    this.url = image.url;
    this.tags = image.tags;
    this.state = image.state;
    this.width = image.width;
    this.height = image.height;
    this.favorite = image.favorite;
    return this;
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
  state: ImageState;
  width: number;
  height: number;
  favorite?: boolean;
}
