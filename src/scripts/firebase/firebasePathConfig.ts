import { firestore, storage } from "./firebase";
import { collection, doc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { ref } from "firebase/storage";

const APP_NAME = "image-gallery";

export const APP_REF = doc(firestore, `${APP_NAME}/public`);
export const USERS_REF = collection(APP_REF, "users");
export const USER_REF = (user: User) => doc(USERS_REF, user.uid);
export const IMAGES_REF = (user: User) => collection(USER_REF(user), "images");
export const ALBUMS_REF = (user: User) => collection(USER_REF(user), "albums");
export const TAGS_REF = (user: User) => collection(USER_REF(user), "tags");
export const STORAGE_BUCKET_IMAGES_REF = (user: User) => ref(storage, `${APP_NAME}/${user.uid}`);
export const STORAGE_BUCKET_IMAGE_REF = (user: User, imageName: string) =>
  ref(STORAGE_BUCKET_IMAGES_REF(user), imageName);
