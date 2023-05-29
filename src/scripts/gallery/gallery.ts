import type Album from "./album";
import type Image from "./image";
import type Tag from "./tag";


export default class Gallery {
  constructor(
    public images: Image[],
    private _albums: Album[],
    public tags: Tag[],
    public favoriteAlbum?: Album
  ) {
  }

  public get albums(): Album[] {
    return this._albums;
  }

  public get albumsWithFavorites(): Album[] {
    return [
      ...this.albums,
      ...(this.favoriteAlbum ? [this.favoriteAlbum] : [])
    ];
  }
}
