import type Entry from "./entry";

export default class Tag implements Entry {
  constructor(public id: string, public name: string, public description: string) {
  }

  public modifyWith(tag: Tag): Tag {
    this.name = tag.name;
    this.description = tag.description;
    return this;
  }
}

/**
 * Data structure for tag data from Firestore.
 */
export interface TagData {
  id?: string;
  name: string;
  description: string;
}
