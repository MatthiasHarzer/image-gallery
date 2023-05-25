import type { User } from "firebase/auth";
import { addDoc, CollectionReference, DocumentReference, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { ALBUMS_REF, IMAGES_REF, STORAGE_BUCKET_IMAGE_REF, TAGS_REF, USER_REF } from "./firebasePathConfig";
import type { TagData } from "../gallery/tag";
import Tag from "../gallery/tag";
import type { ImageData } from "../gallery/image";
import Image from "../gallery/image";
import type { AlbumData } from "../gallery/album";
import Album from "../gallery/album";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import type { UploadTask } from "firebase/storage";
import FirestoreGalleryListener from "./firestoreGalleryListener";
import type Gallery from "../gallery/gallery";


export default class FirestoreManager {
  // private

  public async createUserIfNotExists(user: User): Promise<void> {
    if (user === null) return;
    const userRef = USER_REF(user);
    const userDocSnapshot = await getDoc(userRef);

    if (!userDocSnapshot.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    }
  }

  public getGallery(user: User): FirestoreGalleryListener {
    return new FirestoreGalleryListener(user);
  }



  public async uploadImages(user: User, images: File[], update: (value: number) => void): Promise<void> {
    if (user === null) return;
    const numberOfImages = images.length;
    let numberOfFinishedImages = 0;


    for (const image of images) {
      await this.uploadImage(user, image);
      numberOfFinishedImages++;
      update(numberOfFinishedImages / numberOfImages);
    }
  }


  private async createImageNode(user: User, image: File): Promise<DocumentReference> {
    const imagesRef = IMAGES_REF(user);
    return await addDoc(imagesRef, {
      name: image.name,
      description: "",
      url: "",
      tags: [],
      state: "uploading",
    });
  }

  private async uploadImage(user: User, image: File): Promise<void> {
    const imageNode = await this.createImageNode(user, image);
    // const imageName = `${imageNode.id}.${image.name.split(".").pop()}`;
    const imageRef = imageNode.id;
    const storageRef = STORAGE_BUCKET_IMAGE_REF(user, imageRef);
    const bucket = await uploadBytesResumable(storageRef, image);

    await updateDoc(imageNode, {
      url: await getDownloadURL(bucket.ref),
    });
  }
}
