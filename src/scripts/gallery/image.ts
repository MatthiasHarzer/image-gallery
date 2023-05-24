import type Entry from "./entry";
import type Tag from "./tag";

export default class Image implements Entry {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public url: string,
    public tags: Tag[]
  ) {
  }
}
