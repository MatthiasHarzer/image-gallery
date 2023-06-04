import type Entry from "./entry";
import type Tag from "./tag";
import { getSrc, getThumbnailSrc } from "../util/cacheHelper";


export enum ImageState {
  uploading = "uploading",
  ready = "ready",
  error = "error",
  unknown = "unknown",
}

export default class Image implements Entry {

  public get src(): string {
    return getSrc(this.url);
  }

  public get thumbnailSrc(): string {
    return getThumbnailSrc(this.url);
  }

  constructor(
    public id: string,
    public name: string,
    public description: string,
    public url: string,
    public tags: Tag[],
    public state: ImageState = ImageState.ready,
    public width: number,
    public height: number,
    public timestamp: Date,
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
    this.timestamp = image.timestamp;
    this.favorite = image.favorite;
    return this;
  }

  public toJson(): ImageData {
    return {
      name: this.name,
      description: this.description,
      url: this.url,
      tags: this.tags.map((tag) => tag.id),
      state: this.state,
      width: this.width,
      height: this.height,
      timestamp: this.timestamp,
      favorite: this.favorite,
    };
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
  timestamp: Date;
  favorite?: boolean;
}
