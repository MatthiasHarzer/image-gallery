import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type { Readable, Writable } from "svelte/store";
import { readable, writable } from "svelte/store";
import { auth } from "./firebase";
import type Gallery from "../gallery/gallery";
import FirestoreManager from "./firestoreManager";

export const firestoreManager = new FirestoreManager();

const createFirebaseUser = (): Readable<User | null> => {
  return readable(null, (set) => {
    return onAuthStateChanged(auth, async (user) => {
      await firestoreManager.createUserIfNotExists(user);
      set(user);
    });
  });
}


export const firebaseUser: Readable<User | null> = createFirebaseUser();

const createGallery = () => {
  return readable(null, (set) => {
    return firebaseUser.subscribe(async (user) => {
      if (user === null) {
        set(null);
        return;
      }

      const gallery = await firestoreManager.fetchGallery(user);

      set(gallery);
    });
  });
}

export const gallery: Readable<Gallery | null> = createGallery();
