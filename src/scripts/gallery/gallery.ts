import type Entry from "./entry";
import type Album from "./album";
import type Tag from "./tag";


export default class Gallery implements Entry {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public albums: Album[],
  ) {
  }

}
