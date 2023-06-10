import type Entry from "./entry";

export default class Tag implements Entry {
  constructor(
      public id: string,
      public name: string,
      public description: string,
      public count: number = 0,
  ) {
  }

  public modifyWith(tag: Tag): Tag {
    this.name = tag.name;
    this.description = tag.description;
    this.count = tag.count;
    return this;
  }

  public copy(): Tag {
    return new Tag(this.id, this.name, this.description);
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
