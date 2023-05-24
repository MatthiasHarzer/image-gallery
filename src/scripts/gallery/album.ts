import type Entry from "./entry";
import type Image from "./image";

export default class Album implements Entry {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public images: Image[],
    public children: Album[],
    public parent: Album | null,
    public cover: Image | null
  ) {
  }
}
