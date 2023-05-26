import type Entry from "./entry";
import type Album from "./album";
import type Image from "./image";
import type Tag from "./tag";


export default class Gallery{
  constructor(
    public images: Image[],
    public albums: Album[],
    public tags: Tag[],
  ) {
  }

  public modifyWith(gallery: Gallery): Gallery {
    this.images = gallery.images;
    this.albums = gallery.albums;
    this.tags = gallery.tags;
    return this;
  }

}
