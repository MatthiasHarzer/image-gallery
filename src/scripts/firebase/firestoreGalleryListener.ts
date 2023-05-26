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
  private gallery: Gallery;
  private callbacks: ((gallery: Gallery) => void)[] = [];
  private subscriptions: (() => void)[];

  private skeleton: GallerySkeleton = new GallerySkeleton([], [], []);
  private lastBroadcast = 0;
  private broadcastDelay = 1000;
  private broadcastTimeout: NodeJS.Timeout | null = null;

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

  private createSnapshotResolver(key: GallerySkeletonKey): (snapshot: QuerySnapshot) => Promise<void> {
    return async (snapshot: QuerySnapshot) => {
      this.skeleton[key] = snapshot.docs.map((doc) => dataWithId(doc) as any);
      await this.syncGallery();
    }
  }

  /**
   * Builds the gallery from the skeleton and calls the callbacks
   */
  private async syncGallery(): Promise<void> {
    const { tags: tagsData, images: imagesData, albums: albumsData } = this.skeleton;

    const tags = tagsData.map((tagData) => new Tag(tagData.id, tagData.name, tagData.description));

    const images = imagesData.map((imageData) => {
      const tagsForImage = tags.filter((tag) => imageData.tags.includes(tag.id));

      return new Image(imageData.id, imageData.name, imageData.description, imageData.url, tagsForImage, imageData.state,
        imageData.width, imageData.height);
    });

    const albums = albumsData.map((albumData) => {
      const imagesForAlbum = images.filter((image) => albumData.images.includes(image.id));
      const cover = images.find((image) => image.id === albumData.cover);

      return new Album(albumData.id, albumData.name, albumData.description, imagesForAlbum, [], null, cover);
    });

    // Add children and parent
    albumsData.forEach((albumData) => {
      const album = albums.find((album) => album.id === albumData.id);

      const children = albums.filter((album) => albumData.children.includes(album.id));
      children.forEach((child) => child.parent = album);
      album.children = children;
    });

    this.gallery = new Gallery(images, albums, tags);
    this.broadcast(this.gallery);
  }

  private broadcast(gallery: Gallery): void {

    if (this.broadcastTimeout) {
      return;
    }

    const now = Date.now();
    const timeSinceLastBroadcast = now - this.lastBroadcast;
    if (timeSinceLastBroadcast < this.broadcastDelay) {
      this.broadcastTimeout = setTimeout(() => {
        this.broadcastTimeout = null;
        this.broadcast(gallery);
      }, this.broadcastDelay - timeSinceLastBroadcast);
      return;
    }

    this.lastBroadcast = now;
    this.callbacks.forEach((callback) => callback(gallery));
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
}
