import type { User } from "firebase/auth";
import Gallery from "../gallery/gallery";
import { onSnapshot, orderBy, query, QuerySnapshot } from "firebase/firestore";

import { ALBUMS_REF, IMAGES_REF, TAGS_REF, USER_REF } from "./firebasePathConfig";
import type { AlbumData } from "../gallery/album";
import Album from "../gallery/album";
import type { ImageData } from "../gallery/image";
import Image from "../gallery/image";
import type { TagData } from "../gallery/tag";
import Tag from "../gallery/tag";
import type { Readable } from "svelte/store";
import { readable } from "svelte/store";

type Unsubscriber = () => void;

const dataWithId = (doc: { id: any, data(): any }): any => {
  return {
    ...doc.data(),
    id: doc.id
  }
}

class GallerySkeleton {
  constructor(
    public tags: TagData[],
    public images: ImageData[],
    public albums: AlbumData[],
    public favoritesCover?: string,
  ) {
  }
}

enum GallerySkeletonKey {
  TAGS = "tags",
  IMAGES = "images",
  ALBUMS = "albums",
}

export default class FirestoreGalleryListener {
  private user: User;
  private gallery: Gallery = new Gallery([], [], []);
  private callbacks: ((gallery: Gallery) => void)[] = [];
  private subscriptions: (() => void)[];

  private skeleton: GallerySkeleton = new GallerySkeleton([], [], [], null);
  private cachedImages: Image[] = [];
  private cachedAlbums: Album[] = [];
  private cachedTags: Tag[] = [];

  private fetched: Set<GallerySkeletonKey> = new Set<GallerySkeletonKey>();

  constructor(user: User) {
    this.user = user;

    const imagesRef = IMAGES_REF(user);
    const albumsRef = ALBUMS_REF(user);
    const tagsRef = TAGS_REF(user);

    const imageQuery = query(imagesRef, orderBy("timestamp", "desc"));

    this.subscriptions = [
      onSnapshot(imageQuery, this.createSnapshotResolver(GallerySkeletonKey.IMAGES)),
      onSnapshot(albumsRef, this.createSnapshotResolver(GallerySkeletonKey.ALBUMS)),
      onSnapshot(tagsRef, this.createSnapshotResolver(GallerySkeletonKey.TAGS)),
    ];

    onSnapshot(USER_REF(user), async (snapshot) => {
      const { favoritesCover } = snapshot.data();

      this.skeleton.favoritesCover = favoritesCover;
      await this.syncGallery();
    });
  }

  public get galleryImageStore(): Readable<Image[]> {
    return readable([], (set) => {
      return this.listen((gallery) => {
        set(gallery.images);
      });
    });
  }

  public get ready(): boolean {
    return Object.values(GallerySkeletonKey).every((key) => this.fetched.has(key));
  }

  public getAlbumImageStore(album: Album, includeSubAlbum: boolean = false): Readable<Image[]> {

    const albumIds = [
      album.id,
      ...(includeSubAlbum ? this.getAllSubAlbums(album).map((a) => a.id) : [])
    ];


    return readable([], (set) => {
      return this.listen((gallery) => {
        const images = gallery.albumsWithFavorites.filter((i) => albumIds.includes(i.id)).flatMap((a) => a.images);
        set([...new Set(images)]);
      });
    });
  }

  public getAlbumStore(album: Album): Readable<Album> {
    return readable(null, (set) => {
      return this.listen((gallery) => {
        set(gallery.albumsWithFavorites.find(a => a.id === album.id));
      });
    });
  }

  /**
   * Listen for realtime updates to the gallery.
   * Gets called immediately with the current gallery.
   * @param callback The callback to call when the gallery changes.
   */
  public listen(callback: (gallery: Gallery) => void): Unsubscriber {
    this.callbacks.push(callback);
    this.ready && callback(this.gallery);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    }
  }

  public unsubscribeAll(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
  }

  private getAllSubAlbums(parent: Album): Album[] {
    let albums: Album[] = [];

    let children = [...parent.children];
    let known = new Set<string>();
    known.add(parent.id);

    while (children.length > 0) {
      let child = children.pop();

      if (child === undefined || known.has(child.id)) continue;

      known.add(child.id);

      albums.push(child);
      children = children.concat(child.children);
    }

    return albums;
  }

  private createSnapshotResolver(key: GallerySkeletonKey): (snapshot: QuerySnapshot) => Promise<void> {
    return async (snapshot: QuerySnapshot) => {
      this.fetched.add(key);
      this.skeleton[key] = snapshot.docs.map((doc) => dataWithId(doc) as any);
      await this.syncGallery();
    }
  }

  private getCachedOrInitImage(image: Image): Image {
    let existing = this.cachedImages.find((i) => i.id === image.id);
    if (existing === undefined) {
      this.cachedImages.push(image);
      return image;
    } else {
      return existing.modifyWith(image);
    }
  }

  private getCachedOrInitAlbum(album: Album): Album {
    let existing = this.cachedAlbums.find((a) => a.id === album.id);
    if (existing === undefined) {
      this.cachedAlbums.push(album);
      return album;
    } else {
      return existing.modifyWith(album);
    }
  }

  private getCachedOrInitTag(tag: Tag): Tag {
    let existing = this.cachedTags.find((t) => t.id === tag.id);
    if (existing === undefined) {
      this.cachedTags.push(tag);
      return tag;
    } else {
      return existing.modifyWith(tag);
    }
  }

  /**
   * Builds the gallery from the skeleton and calls the callbacks
   */
  private async syncGallery(): Promise<void> {
    const { tags: tagsData, images: imagesData, albums: albumsData } = this.skeleton;

    const tags = tagsData.map((tagData) => this.getCachedOrInitTag(new Tag(tagData.id, tagData.name, tagData.description)));

    const images = imagesData.map((imageData) => {
      const tagsForImage = tags.filter((tag) => imageData.tags.includes(tag.id));

      return this.getCachedOrInitImage(new Image(imageData.id, imageData.name, imageData.description, imageData.url, tagsForImage, imageData.state,
        imageData.width, imageData.height, imageData.timestamp, imageData.favorite ?? false));
    });

    const albums = albumsData.map((albumData) => {
      const imagesForAlbum = images.filter((image) => albumData.images.includes(image.id));
      imagesForAlbum.sort((a, b) => albumData.images.indexOf(a.id) - albumData.images.indexOf(b.id));
      const cover = images.find((image) => image.id === albumData.cover);

      return this.getCachedOrInitAlbum(new Album(albumData.id, albumData.name, albumData.description, imagesForAlbum, [], null, cover));
    });

    // Add children and parent
    albumsData.forEach((albumData) => {
      const album = albums.find((album) => album.id === albumData.id);

      const parent = albums.find((album) => album.id === albumData.parent);
      album.parent = parent;

      if (parent !== undefined) {
        parent.children.push(album);
      }
    });

    const favoriteImages = images.filter((image) => image.favorite);
    let favoriteAlbum = null;

    if (favoriteImages.length > 0) {
      const cover = images.find((image) => image.id === this.skeleton.favoritesCover) ?? favoriteImages[0];
      favoriteAlbum =this.getCachedOrInitAlbum(new Album("favorites", "Favorites", "Your favorite images", favoriteImages, [], null, cover));

    }

    this.gallery = new Gallery(images, albums, tags, favoriteAlbum);
    this.broadcast(this.gallery);
  }

  private broadcast(gallery: Gallery): void {
    if (!this.ready) return;
    this.callbacks.forEach((callback) => callback(gallery));
  }
}
