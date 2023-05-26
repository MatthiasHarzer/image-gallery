import type { User } from "firebase/auth";
import Gallery from "../gallery/gallery";
import { onSnapshot, QuerySnapshot } from "firebase/firestore";

import { ALBUMS_REF, IMAGES_REF, TAGS_REF } from "./firebasePathConfig";
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

  private skeleton: GallerySkeleton = new GallerySkeleton([], [], []);
  private cachedImages: Image[] = [];
  private cachedAlbums: Album[] = [];
  private cachedTags: Tag[] = [];

  constructor(user: User) {
    this.user = user;

    const imagesRef = IMAGES_REF(user);
    const albumsRef = ALBUMS_REF(user);
    const tagsRef = TAGS_REF(user);

    this.subscriptions = [
      onSnapshot(imagesRef, this.createSnapshotResolver(GallerySkeletonKey.IMAGES)),
      onSnapshot(albumsRef, this.createSnapshotResolver(GallerySkeletonKey.ALBUMS)),
      onSnapshot(tagsRef, this.createSnapshotResolver(GallerySkeletonKey.TAGS)),
    ];
  }

  public get galleryImageStore(): Readable<Image[]> {
    return readable([], (set) => {
      return this.listen((gallery) => {
        set(gallery.images);
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
    callback(this.gallery);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    }
  }

  public unsubscribeAll(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
  }

  private createSnapshotResolver(key: GallerySkeletonKey): (snapshot: QuerySnapshot) => Promise<void> {
    return async (snapshot: QuerySnapshot) => {
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
    }else{
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
        imageData.width, imageData.height, imageData.favorite ?? false));
    });

    const albums = albumsData.map((albumData) => {
      const imagesForAlbum = images.filter((image) => albumData.images.includes(image.id));
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

    this.gallery = new Gallery(images, albums, tags);
    this.broadcast(this.gallery);
  }

  private broadcast(gallery: Gallery): void {
    this.callbacks.forEach((callback) => callback(gallery));
  }
}
