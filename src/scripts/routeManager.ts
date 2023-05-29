import { Screen } from "./screen";
import type { Writable } from "svelte/store";
import { get, writable } from "svelte/store";
import type Album from "./gallery/album";
import type Image from "./gallery/image";
import { gallery } from "./firebase/firebaseManager";

class Route {

  constructor(
    public screen: Screen,
    public albums: Album[],
    public fullscreenImage: Image | null) {
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
      .map(a => availableAlbums.find(aa => aa.id === a)).filter(a => a != null);
    const fullscreenImage = availableImages.find(i => i.id === image) || null;

    return new Route(screen, galleryAlbums, fullscreenImage);
  }

  public toPath(): string {
    let path = `/${this.screen}`;
    if (this.albums.length > 0) {
      path += `/album@${this.albums.map(a => a.id).join(":")}`;
    }

    if (this.fullscreenImage) {
      path += `/image@${this.fullscreenImage.id}`;
    }

    return path;
  }
}

let defaultRoute = new Route(Screen.GALLERY, [], null);


type Router = Writable<Route> & {
  push: (route: Route) => void;
  setAlbums: (albums: Album[]) => void;
  addAlbum: (album: Album) => void;
  removeAlbum: (album: Album) => void;
  popAlbum: () => Album;
  setScreen: (screen: Screen) => void;
  setFullscreenImage: (image: Image, replace?: boolean) => void;
  clear: () => void;
}

const albumRouteRegex = /^album@(.+$)/;
const imageRouteRegex = /^image@(.+$)/;


// const

const createRoute = (): Router => {
  let route = Route.fromString(window.location.pathname);
  const { subscribe, set, update } = writable<Route>(route);



  const setRouteInternal = (r: Route) => {
    route = r;
    set(route);
  }

  const push = (r: Route, replace: boolean = false) => {
    setRouteInternal(r);
    const path = route.toPath();
    if (replace) window.history.replaceState({}, "", path);
    else window.history.pushState({}, "", path);
  }

  gallery.subscribe((g) => {
    setRouteInternal(Route.fromString(window.location.pathname));
  });

  window.addEventListener("popstate", () => {
    route = Route.fromString(window.location.pathname);
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
      route.albums = route.albums.filter(a => a.id !== album.id);
      push(route);
    },
    popAlbum(): Album {
      const popped = route.albums.pop();
      push(route);
      return popped;
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
      push(defaultRoute)
    }
  }
}

export const route: Router = createRoute();


