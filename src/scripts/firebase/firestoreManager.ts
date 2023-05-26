import type { User } from "firebase/auth";
import { addDoc, deleteDoc, doc, DocumentReference, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ALBUMS_REF, IMAGE_REF, IMAGES_REF, STORAGE_BUCKET_IMAGE_REF, TAGS_REF, USER_REF } from "./firebasePathConfig";

import { deleteObject, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import FirestoreGalleryListener from "./firestoreGalleryListener";
import { default as CustomImage, ImageState } from "../gallery/image";
import type Tag from "../gallery/tag";
import type { TagData } from "../gallery/tag";
import type Album from "../gallery/album";


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

  public async deleteImage(user: User, image: CustomImage): Promise<void> {
    const imageRef = IMAGE_REF(user, image);
    const storageRef = STORAGE_BUCKET_IMAGE_REF(user, image.id);

    await Promise.all([
      deleteDoc(imageRef),
      deleteObject(storageRef),
    ]);
  }

  public updateImageProps(user: User, image: CustomImage, updateData: { [key: string]: any }): Promise<void> {
    const imageRef = IMAGE_REF(user, image);
    return updateDoc(imageRef, updateData);
  }

  public async createTag(user: User, tag: TagData): Promise<DocumentReference> {
    if (tag.name === "") return Promise.reject("Tag name is empty");

    const tagsRef = TAGS_REF(user);

    return await addDoc(tagsRef, tag);
  }

  public async deleteTag(user: User, tag: Tag): Promise<void> {
    const tagRef = doc(TAGS_REF(user), tag.id);
    await deleteDoc(tagRef);
  }

  public async updateTag(user: User, tag: Tag, updateData: { [key: string]: any }): Promise<void> {
    const tagRef = doc(TAGS_REF(user), tag.id);

    await updateDoc(tagRef, updateData);
  }

  public async addTagToImage(user: User, image: CustomImage, tag: Tag): Promise<void> {
    const imageRef = IMAGE_REF(user, image);

    if (tag.id == null) return;
    const imageTagsId = image.tags.map(t => t.id);
    if (imageTagsId.includes(tag.id)) return;

    await updateDoc(imageRef, {
      tags: [...imageTagsId, tag.id],
    });
  }

  public async removeTagFromImage(user: User, image: CustomImage, tag: Tag): Promise<void> {
    const imageRef = IMAGE_REF(user, image);

    if (tag.id == null) return;
    const imageTagsId = image.tags.map(t => t.id);
    if (!imageTagsId.includes(tag.id)) return;

    await updateDoc(imageRef, {
      tags: imageTagsId.filter(t => t !== tag.id),
    });
  }

  public async createAlbum(user: User, album: Album): Promise<DocumentReference> {
    const albumsRef = ALBUMS_REF(user);

    return await addDoc(albumsRef, {
      name: album.name,
      description: album.description ?? "",
      images: [],
      children: [],
      parent: album.parent?.id ?? null,
      cover: null,
    });
  }

  public async updateAlbum(user: User, album: Album): Promise<void> {
    const albumRef = doc(ALBUMS_REF(user), album.id);

    await updateDoc(albumRef, {
      name: album.name,
      description: album.description,
      images: album.images.map(i => i.id),
      children: album.children.map(a => a.id),
      parent: album.parent?.id ?? null,
      cover: album.cover?.id ?? null,
    });

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
      state: ImageState.ready,
    });
  }
}
