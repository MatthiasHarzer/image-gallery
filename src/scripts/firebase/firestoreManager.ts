import type {User} from "firebase/auth";
import {
  addDoc,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import {ALBUMS_REF, IMAGE_REF, IMAGES_REF, STORAGE_BUCKET_IMAGE_REF, TAGS_REF, USER_REF} from "./firebasePathConfig";

import {deleteObject, getDownloadURL, uploadBytesResumable} from "firebase/storage";
import FirestoreGalleryListener from "./firestoreGalleryListener";
import {default as CustomImage, ImageState} from "../gallery/image";
import type Tag from "../gallery/tag";
import type {TagData} from "../gallery/tag";
import type Album from "../gallery/album";
import {firestore} from "./firebase";


export default class FirestoreManager {
  // private

  public async createUserIfNotExists(user: User): Promise<void> {
    if (user === null) return;
    const userRef = USER_REF(user);
    const userDocSnapshot = await getDoc(userRef);

    if (!userDocSnapshot.exists()) {
      await setDoc(userRef, {
        name: user.displayName, email: user.email, photoURL: user.photoURL,
      });
    }
  }

  public getGallery(user: User): FirestoreGalleryListener {
    return new FirestoreGalleryListener(user);
  }


  public async uploadImages(user: User, images: File[], update: (value: number) => void, targetAlbum: Album | null = null): Promise<void> {
    if (user === null) return;
    const numberOfImages = images.length;
    let numberOfFinishedImages = 0;

    let imageIds: string[] = [];

    for (const image of images) {
      imageIds.push(await this.uploadImage(user, image));
      numberOfFinishedImages++;
      update(numberOfFinishedImages / numberOfImages);
    }
    if (targetAlbum == null) return;
    await this.updateAlbumProps(user, targetAlbum, {images: [...targetAlbum.images.map(a => a.id), ...imageIds]});
  }

  public async deleteImage(user: User, image: CustomImage): Promise<void> {
    const imageRef = IMAGE_REF(user, image);
    const storageRef = STORAGE_BUCKET_IMAGE_REF(user, image.id);

    await Promise.all([deleteDoc(imageRef), deleteObject(storageRef),]);
  }

  public async multiDeleteImages(user: User, images: CustomImage[]): Promise<void> {
    const firestoreBatch = writeBatch(firestore);

    for (const image of images) {
      const imageRef = IMAGE_REF(user, image);
      const storageRef = STORAGE_BUCKET_IMAGE_REF(user, image.id);
      firestoreBatch.delete(imageRef);
      await deleteObject(storageRef)
    }
    await firestoreBatch.commit();
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

  public async updateTag(user: User, tag: Tag): Promise<void> {
    const tagRef = doc(TAGS_REF(user), tag.id);

    await updateDoc(tagRef, {
        name: tag.name,
        description: tag.description,
    });
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

  public async createOrUpdateAlbum(user: User, album: Album): Promise<void> {
    const isNew = album.id == null;

    if (isNew) {
      const albumRef = await this.createAlbum(user, album);
      album.id = albumRef.id;
    } else {
      await this.updateAlbum(user, album);
    }
  }

  public async deleteAlbum(user: User, album: Album): Promise<void> {
    if (!album.valid) return;
    const albumRef = doc(ALBUMS_REF(user), album.id);

    await deleteDoc(albumRef);
  }

  public async updateAlbumProps(user: User, album: Album, updateData: { [key: string]: any }): Promise<void> {
    if (!album.valid) return;
    const albumRef = doc(ALBUMS_REF(user), album.id);


    await updateDoc(albumRef, updateData);
  }

  public async updateFavoriteAlbumCover(user: User, image: CustomImage): Promise<void> {
    const ref = USER_REF(user);
    await updateDoc(ref, {
      favoritesCover: image.id,
    });
  }

  private async createAlbum(user: User, album: Album): Promise<DocumentReference> {
    const albumsRef = ALBUMS_REF(user);

    return await addDoc(albumsRef, {
      name: album.name,
      description: album.description ?? "",
      images: album.images.map(i => i.id),
      parent: album.parent?.id ?? null,
      cover: null,
      timestamp: serverTimestamp(),
    });
  }

  private async updateAlbum(user: User, album: Album): Promise<void> {
    if (!album.valid) return;
    const albumRef = doc(ALBUMS_REF(user), album.id);

    await updateDoc(albumRef, {
      name: album.name,
      description: album.description,
      images: album.images.map(i => i.id),
      parent: album.parent?.id ?? null,
      cover: album.cover?.id ?? null,
      autoTags: album.autoTags?.map(t => t.id) ?? [],
      forceSort: album.forceSort,
    });

  }

  private async createImageNode(user: User, image: File): Promise<DocumentReference> {
    const imagesRef = IMAGES_REF(user);

    // Get images dimensions
    const imageDimensions = await new Promise<{ width: number, height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({width: img.width, height: img.height});
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
      timestamp: serverTimestamp(),
    });
  }

  private async uploadImage(user: User, image: File): Promise<string> {
    const imageNode = await this.createImageNode(user, image);
    // const imageName = `${imageNode.id}.${image.name.split(".").pop()}`;
    const imageRefId = imageNode.id;
    const storageRef = STORAGE_BUCKET_IMAGE_REF(user, imageRefId);
    const bucket = await uploadBytesResumable(storageRef, image);

    await updateDoc(imageNode, {
      url: await getDownloadURL(bucket.ref), state: ImageState.ready,
    });
    return imageRefId;
  }

  public async updateMultiImages(user: User, images: CustomImage[]): Promise<void> {
    const firestoreBatch = writeBatch(firestore);

    for (const image of images) {
      const imageRef = IMAGE_REF(user, image);
      // @ts-ignore
      firestoreBatch.update(imageRef, image.toJson());
    }
    await firestoreBatch.commit();
  }

}
