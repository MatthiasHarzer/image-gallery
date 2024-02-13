import { Screen } from "./screen";
import type { Writable } from "svelte/store";
import { get, writable } from "svelte/store";
import type Album from "./gallery/album";
import type Image from "./gallery/image";
import { gallery } from "./firebase/firebaseManager";

export class Route {
  constructor(
    public screen: Screen,
    public albums: Album[],
    public fullscreenImage: Image | null,
    public tagInputFocused: boolean | null = null,
  ) {}

  public get album(): Album | null {
    return this.albums.length > 0 ? this.albums[this.albums.length - 1] : null;
  }

  public static fromString(route: string): Route {
    const parts = route.split("/").slice(1);

    if (parts.length === 0) return defaultRoute;

    const screen = (parts[0] as Screen) || defaultRoute.screen;
    let albums: string[] = [];
    let image: string = null;

    for (const part of parts.slice(1)) {
      if (albumRouteRegex.test(part)) {
        const [, rawAlbums] = part.match(albumRouteRegex);
        albums = rawAlbums.split(":");
      } else if (imageRouteRegex.test(part)) {
        const [, rawImage] = part.match(imageRouteRegex);
        image = rawImage;
      }
    }

    const availableAlbums = get(gallery).albumsWithFavorites;
    const availableImages = get(gallery).images;

    const galleryAlbums = albums
      .map((a) => availableAlbums.find((aa) => aa.id === a))
      .filter((a) => a != null);
    const fullscreenImage = availableImages.find((i) => i.id === image) || null;

    return new Route(screen, galleryAlbums, fullscreenImage);
  }

  public toPath(): string {
    let path = this.toPathWithoutImage();

    if (this.fullscreenImage) {
      path += `/image@${this.fullscreenImage.id}`;
    }

    return path;
  }

  public toPathWithoutImage(): string {
    let path = `/${this.screen}`;
    if (this.albums.length > 0) {
      path += `/album@${this.albums.map((a) => a.id).join(":")}`;
    }

    return path;
  }
}

const defaultRoute = new Route(Screen.GALLERY, [], null);

type Router = Writable<Route> & {
  push: (route: Route) => void;
  setAlbums: (albums: Album[]) => void;
  addAlbum: (album: Album) => void;
  removeAlbum: (album: Album) => void;
  popAlbum: () => Album;
  currentAlbum: () => Album | null;
  setScreen: (screen: Screen) => void;
  setFullscreenImage: (image: Image, replace?: boolean) => void;
  clear: () => void;
};

const albumRouteRegex = /^album@(.+$)/;
const imageRouteRegex = /^image@(.+$)/;
const localStorageKey = "route";

const getPathnameOrLocal = () => {
  const localRoute = localStorage.getItem(localStorageKey);
  const presentRoute = window.location.pathname;
  const presentRouteIsEmpty = presentRoute === "/";

  return presentRouteIsEmpty ? localRoute ?? "/" : presentRoute;
};

const createRoute = (): Router => {
  const initPath = getPathnameOrLocal();

  // window.history.replaceState({}, "", initPath)
  let route = Route.fromString(initPath);

  const { subscribe, set, update } = writable<Route>(route);

  const setRouteInternal = (r: Route) => {
    route = r;
    set(route);
  };

  const push = (r: Route, replace: boolean = false) => {
    setRouteInternal(r);
    const path = route.toPath();
    if (replace) window.history.replaceState({}, "", path);
    else window.history.pushState({}, "", path);
    localStorage.setItem(localStorageKey, route.toPathWithoutImage());
  };

  let firstLoad = true;
  gallery.subscribe((g) => {
    setRouteInternal(Route.fromString(getPathnameOrLocal()));

    if (firstLoad && g.albums.length > 0) {
      firstLoad = false;
      const initRoute = Route.fromString(initPath);

      const states = [];
      while (initRoute.albums.length > 0) {
        if (initRoute.fullscreenImage != null) {
          initRoute.fullscreenImage = null;
        } else {
          states.push(initRoute.toPath());
          initRoute.albums.pop();
        }
      }

      states.reverse().forEach((s) => {
        window.history.pushState({}, "", s);
      });
      return;
    }
  });

  window.addEventListener("popstate", () => {
    route = Route.fromString(getPathnameOrLocal());
    setRouteInternal(route);
  });

  return {
    push(route: Route): void {
      push(route);
    },
    setAlbums(albums: Album[]): void {
      route.albums = albums;
      push(route);
    },
    addAlbum(album: Album): void {
      route.albums.push(album);
      push(route);
    },
    removeAlbum(album: Album): void {
      route.albums = route.albums.filter((a) => a.id !== album.id);
      push(route);
    },
    popAlbum(): Album {
      const popped = route.albums.pop();
      push(route);
      return popped;
    },
    currentAlbum(): Album | null {
      return route.album;
    },

    setFullscreenImage(image: Image, replace: boolean = false): void {
      route.fullscreenImage = image;
      push(route, replace);
    },
    setScreen(screen: Screen): void {
      route.screen = screen;
      push(route);
    },
    subscribe,
    set,
    update,
    clear: () => {
      push(defaultRoute);
    },
  };
};

export const route: Router = createRoute();
