import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { writable } from "svelte/store";
import { auth } from "./firebase";
import type Gallery from "../gallery/gallery";
import FirestoreManager from "./firestoreManager";

const firestoreManager = new FirestoreManager();

const createFirebaseUser = () => {
  const { subscribe, set } = writable<User | null>(null);

  onAuthStateChanged(auth, async (user) => {
    await firestoreManager.createUserIfNotExists(user);
    set(user);
  });

  return {
    subscribe,
    set,
  };
}


export const firebaseUser = createFirebaseUser();

const createGallery = () => {
  const { subscribe, set } = writable<Gallery | null>(null);

  firebaseUser.subscribe(async (user) => {
    if (user === null) {
      set(null);
      return;
    }

    const gallery = await firestoreManager.fetchGallery(user);

    set(gallery);
  });

  return {
    subscribe,
    set,
  };
}

export const gallery = createGallery();
