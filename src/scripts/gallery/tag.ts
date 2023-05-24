import type Entry from "./entry";

export default class Tag implements Entry {
  constructor(
    public id: number,
    public name: string,
    public description: string) {
  }
}
