import type Entry from "./entry";
import type Album from "./album";
import type Image from "./image";


export default class Gallery{
  constructor(
    public id: string,
    public albums: Album[],
    public images: Image[],
  ) {
  }

}
