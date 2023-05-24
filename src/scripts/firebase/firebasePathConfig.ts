import { firestore } from "./firebase";
import { collection, doc} from "firebase/firestore";
import type { User } from "firebase/auth";


export const APP_REF = doc(firestore, "image-gallery/public");
export const USERS_REF = collection(APP_REF, "users");
export const USER_REF = (user: User) => doc(USERS_REF, user.uid);
export const IMAGES_REF = (user: User) => collection(USER_REF(user), "images");
export const ALBUMS_REF = (user: User) => collection(USER_REF(user), "albums");
export const TAGS_REF = (user: User) => collection(USER_REF(user), "tags");

