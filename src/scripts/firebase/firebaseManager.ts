import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type { Readable } from "svelte/store";
import { readable } from "svelte/store";
import { auth } from "./firebase";
import type Gallery from "../gallery/gallery";
import FirestoreManager from "./firestoreManager";
import type FirestoreGalleryListener from "./firestoreGalleryListener";
import type Album from "../gallery/album";
import type Tag from "../gallery/tag";
import type Image from "../gallery/image";

export const firestoreManager = new FirestoreManager();

const createFirebaseUser = (): Readable<User | null> => {
  return readable(null, (set) => {
    return onAuthStateChanged(auth, async (user) => {
      await firestoreManager.createUserIfNotExists(user);
      set(user);
    });
  });
};

export const firebaseUser: Readable<User | null> = createFirebaseUser();

interface AdvancedGallery extends Gallery {
  listener: FirestoreGalleryListener;
}

class AdvancedGallery {
  private constructor(
    public albums: Album[],
    public images: Image[],
    public tags: Tag[],
    public listener: FirestoreGalleryListener,
    public albumsWithFavorites: Album[],
  ) {}

  public getTagById(id: string): Tag | null {
    return this.tags.find((t) => t.id === id) ?? null;
  }

  public static fromGallery(
    gallery: Gallery,
    listener: FirestoreGalleryListener,
  ): AdvancedGallery {
    return new AdvancedGallery(
      gallery.albums,
      gallery.images,
      gallery.tags,
      listener,
      gallery.albumsWithFavorites,
    );
  }

  public static empty(): AdvancedGallery {
    return new AdvancedGallery([], [], [], null, []);
  }
}

const createGallery = () => {
  let gallerySub;
  let galleryListener: FirestoreGalleryListener | null = null;
  return readable<AdvancedGallery>(AdvancedGallery.empty(), (set) => {
    return firebaseUser.subscribe(async (user) => {
      if (user === null) {
        set(AdvancedGallery.empty());
        gallerySub && gallerySub();
        galleryListener && galleryListener.unsubscribeAll();
        return;
      }

      galleryListener = firestoreManager.getGallery(user);

      gallerySub = galleryListener.listen((gallery) => {
        return set(AdvancedGallery.fromGallery(gallery, galleryListener));
      });
    });
  });
};

export const gallery: Readable<AdvancedGallery> = createGallery();
