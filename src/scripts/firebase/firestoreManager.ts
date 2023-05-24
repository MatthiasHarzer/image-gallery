import type { User } from "firebase/auth";
import Gallery from "../gallery/gallery";
import { addDoc, CollectionReference, DocumentReference, getDoc, getDocs, setDoc } from "firebase/firestore";
import { ALBUMS_REF, IMAGES_REF, STORAGE_BUCKET_IMAGE_REF, TAGS_REF, USER_REF } from "./firebasePathConfig";
import type { TagData } from "../gallery/tag";
import Tag from "../gallery/tag";
import type { ImageData } from "../gallery/image";
import Image from "../gallery/image";
import type { AlbumData } from "../gallery/album";
import Album from "../gallery/album";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import type { UploadTask } from "firebase/storage";


export default class FirestoreManager {

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

  public async fetchGallery(user: User): Promise<Gallery> {
    const imagesRef = IMAGES_REF(user);
    const albumsRef = ALBUMS_REF(user);
    const tagsRef = TAGS_REF(user);

    const tags = await this.fetchTags(tagsRef);
    const images = await this.fetchImages(imagesRef, tags);
    const albums = await this.fetchAlbums(albumsRef, images);

    return new Gallery(user.uid, albums, images);
  }

  public async uploadImages(user: User, images: File[]): Promise<void> {

  }

  private async fetchTags(tagsRef: CollectionReference): Promise<Tag[]> {
    const snapshot = await getDocs(tagsRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as TagData;
      return new Tag(doc.id, data.name, data.description);
    });
  }

  private async fetchImages(imagesRef: CollectionReference, tags: Tag[]): Promise<Image[]> {
    const snapshot = await getDocs(imagesRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as ImageData;

      const imageTags = data.tags
        .map((tagId: string) => tags.find((tag) => tag.id === tagId))
        .filter((tag) => tag !== undefined);

      return new Image(doc.id, data.name, data.description, data.url, imageTags, data.imageState);
    });

  }

  private async fetchAlbums(albumsRef: CollectionReference, images: Image[]): Promise<Album[]> {
    const snapshot = await getDocs(albumsRef);

    const albumsData = snapshot.docs.map((doc) => [doc.id, doc.data()] as [string, AlbumData]);

    const albums = albumsData.map(([id, data]) => {
      const albumImages = data.images
        .map((imageId: string) => images.find((image) => image.id === imageId))
        .filter((image) => image !== undefined);

      const cover = albumImages.find((image) => image.id === data.cover) ?? null;

      return new Album(id, data.name, data.description, albumImages, [], null, cover);
    });

    // Add children and parent references
    albumsData.forEach(([id, data]) => {
      const album = albums.find((album) => album.id === id);
      const children = albums.filter((album) => album.id !== id && data.children.includes(album.id));
      const parent = albums.find((album) => album.id === data.parent);

      album.children = children;
      album.parent = parent;
    });

    return albums;
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

  private async uploadImage(user: User, image: File): Promise<UploadTask> {
    const imageNode = await this.createImageNode(user, image);
    // const imageName = `${imageNode.id}.${image.name.split(".").pop()}`;
    const imageRef = imageNode.id;
    const storageRef = STORAGE_BUCKET_IMAGE_REF(user, imageRef);

    return uploadBytesResumable(storageRef, image);
  }

  public async uploadImages(user: User, images: File[]): Promise<void> {

  }
}
