import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { Auth, User } from "firebase/auth";
import { writable } from "svelte/store";

export const firebaseObserver = writable<User | null>(null)

class FirebaseManager {
  private readonly app: FirebaseApp;
  private readonly auth: Auth;

  constructor(firebaseConfig) {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);

    onAuthStateChanged(this.auth, this.onAuthChanged);
  }

  private onAuthChanged(user: User) {
    firebaseObserver.set(user);
  }

}
