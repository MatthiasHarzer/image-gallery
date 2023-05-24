import type Entry from "./entry";

export default class Tag implements Entry {
  constructor(
    public id: string,
    public name: string,
    public description: string) {
  }
}

/**
 * Data structure for tag data from Firestore.
 */
export interface TagData {
  name: string;
  description: string;
}
