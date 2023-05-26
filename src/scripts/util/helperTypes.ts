import type { Readable, Writable } from "svelte/store";

export type ReadWritable<T> = Readable<T> | Writable<T>;
