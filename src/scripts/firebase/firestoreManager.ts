import type { User } from "firebase/auth";
import { addDoc, DocumentReference, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { IMAGES_REF, STORAGE_BUCKET_IMAGE_REF, USER_REF } from "./firebasePathConfig";

import { getDownloadURL, uploadBytesResumable } from "firebase/storage";
import FirestoreGalleryListener from "./firestoreGalleryListener";


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

    // Get images dimensions
    const imageDimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(image);
    });

    return await addDoc(imagesRef, {
      name: image.name,
      description: "",
      url: "",
      tags: [],
      state: "uploading",
      width: imageDimensions.width,
      height: imageDimensions.height,
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
