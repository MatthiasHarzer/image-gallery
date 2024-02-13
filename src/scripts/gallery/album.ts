import type Entry from "./entry";
import type Image from "./image";
import type Tag from "./tag";

export default class Album implements Entry {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public images: Image[],
    public children: Album[],
    public parent: Album | null,
    public cover: Image | null,
    public autoTags: Tag[] = [],
    public forceSort: boolean = false,
  ) {}

  public get valid(): boolean {
    return this.id != null && this.id !== "favorites";
  }

  public get isRoot(): boolean {
    return this.id == null;
  }

  public get isFavorites(): boolean {
    return this.id === "favorites";
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
    this.autoTags = album.autoTags;
    this.forceSort = album.forceSort;
    return this;
  }

  public getTags(): Tag[] {
    const albums = [this, ...this.getAllSubAlbums()];

    const tags = albums.reduce((acc, album) => {
      acc.push(...album.images.flatMap((i) => i.tags));
      return acc;
    }, [] as Tag[]);

    return [...new Set(tags)];
  }

  public copy(): Album {
    return new Album(
      this.id,
      this.name,
      this.description,
      this.images,
      this.children,
      this.parent,
      this.cover,
      this.autoTags,
      this.forceSort,
    );
  }

  /**
   * Determines all sub albums of this album. This does not include the album itself.
   * Also handles circular references.
   *
   * @returns {Album[]} All sub albums of this album.
   */
  public getAllSubAlbums(): Album[] {
    const albums: Album[] = [];

    let children = [...this.children];
    const known = new Set<string>(this.id);

    while (children.length > 0) {
      const child = children.pop();

      if (child === undefined || known.has(child.id)) continue;

      known.add(child.id);

      albums.push(child);
      children = children.concat(child.children);
    }

    return albums;
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
  autoTags: string[] | null;
  forceSort?: boolean;
}
