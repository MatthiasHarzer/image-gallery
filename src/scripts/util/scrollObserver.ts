import type { Readable, Writable } from "svelte/store";
import { get, readable, writable } from "svelte/store";

/**
 * The scroll direction enum.
 */
enum ScrollDirection {
  Horizontal,
  Vertical
}

/**
 * The scroll observer parameters.
 */
interface ScrollObserverParams {
  /**
   * If true, the scroll observer will only observe the scroll direction that was first detected.
   */
  uniDirectional?: boolean;
}

/**
 * An event containing scroll information, such as the scroll direction, delta and speed of scrolling.
 * Note that the speed is signed, meaning that it can be negative.
 */
export interface ScrollObserverEvent {
  deltaX: number;
  deltaY: number;
  direction: ScrollDirection | null;
  speedX: number;
  speedY: number;
  progressX: number;
  progressY: number;
}

/**
 * A scroll event stamp, used to calculate the speed of scrolling.
 */
interface ScrollEventStamp {
  time: number;
  deltaX: number;
  deltaY: number;
}

const defaultScrollEvent: ScrollObserverEvent = {
  deltaX: 0,
  deltaY: 0,
  direction: null,
  speedX: 0,
  speedY: 0,
  progressX: 0,
  progressY: 0
};

type ScrollDelta = [x: number, y: number];
type ScrollSpeed = [dx: number, dy: number];
type ScrollProgress = [x: number, y: number];
type ScrollEndCallback = (pos: ScrollDelta, speed: ScrollSpeed, progress: ScrollProgress) => void;

/**
 * A scroll observer, which emits events whenever the user scrolls inside the observed element.
 */
export type ScrollObserver = Readable<ScrollObserverEvent> & {
  onScrollEnd: (callback: ScrollEndCallback) => void;
};

const createEmptyScrollObserver = (): ScrollObserver => {
  return {
    ...readable(defaultScrollEvent),
    onScrollEnd: () => {
    }
  };
}

/**
 * Creates a scroll observer for the given element. The scroll observer will emit events whenever the user scrolls
 * inside the element.
 * @param element The element to observe.
 * @param params The scroll observer parameters.
 */
export const createScrollObserver = (element: HTMLElement = null, params: ScrollObserverParams = {}): ScrollObserver => {

  if (element == null)
    return createEmptyScrollObserver();

  let startPosition: ScrollSpeed = [0, 0];
  let deltaPosition: ScrollDelta = [0, 0];
  let initialScrollDirection: ScrollDirection | null = null;
  let scrollEventStamps: ScrollEventStamp[] = [];
  let pointerTouchDown = false;
  const uniDirectional = params?.uniDirectional ?? false;
  const eventStore: Writable<ScrollObserverEvent> = writable(defaultScrollEvent);
  const clientDimensions = [element.clientWidth, element.clientHeight];

  const get_delta = (): ScrollDelta => {
    if (!uniDirectional)
      return deltaPosition;

    return [
      initialScrollDirection == ScrollDirection.Vertical ? 0 : deltaPosition[0],
      initialScrollDirection == ScrollDirection.Horizontal ? 0 : deltaPosition[1]
    ]
  }

  const get_direction = (): ScrollDirection | null => {
    if (uniDirectional)
      return initialScrollDirection;

    return deltaPosition[0] > deltaPosition[1] ? ScrollDirection.Horizontal : ScrollDirection.Vertical;
  }

  const get_speed = (): ScrollSpeed => {
    const last_stamp = scrollEventStamps[scrollEventStamps.length - 1];
    const first_valid_stamp = scrollEventStamps.find(stamp => stamp.time > Date.now() - 1000);

    if (last_stamp == null || first_valid_stamp == null)
      return [0, 0];

    const delta_time = last_stamp.time - first_valid_stamp.time;
    const delta_x = last_stamp.deltaX - first_valid_stamp.deltaX;
    const delta_y = last_stamp.deltaY - first_valid_stamp.deltaY;

    if (delta_time == 0)
      return [0, 0];

    return [delta_x / delta_time, delta_y / delta_time];
  }

  const get_progress = (position: ScrollDelta): ScrollProgress => {
    return [
      position[0] / clientDimensions[0],
      position[1] / clientDimensions[1]
    ]
  }

  const update = () => {
    const [delta_x, delta_y] = get_delta();
    const direction = get_direction();


    scrollEventStamps.push({
      time: Date.now(),
      deltaX: delta_x,
      deltaY: delta_y
    });

    const speed = get_speed();
    const progress = get_progress([delta_x, delta_y]);

    const event: ScrollObserverEvent = {
      deltaX: delta_x,
      deltaY: delta_y,
      direction: direction,
      speedX: speed[0],
      speedY: speed[1],
      progressX: progress[0],
      progressY: progress[1]
    }

    eventStore.set(event);
  }

  let onScrollEndCallback: ScrollEndCallback = null;

  const handle_start = (pos: [number, number]) => {
    pointerTouchDown = true;
    startPosition = pos;
    update();
  }

  const handle_move = (pos: [number, number]) => {
    if (!pointerTouchDown) return;
    deltaPosition = [
      pos[0] - startPosition[0],
      pos[1] - startPosition[1]
    ]

    if (initialScrollDirection == null) {
      const abs_delta_x = Math.abs(deltaPosition[0]);
      const abs_delta_y = Math.abs(deltaPosition[1]);
      if (abs_delta_x > abs_delta_y) {
        initialScrollDirection = ScrollDirection.Horizontal;
      } else {
        initialScrollDirection = ScrollDirection.Vertical;
      }
    }
    update();
  }

  const handle_end = (_) => {
    pointerTouchDown = false;
    const delta = get_delta();
    onScrollEndCallback?.(delta, get_speed(), get_progress(delta));
    deltaPosition = [0, 0];
    initialScrollDirection = null;
    update();

    scrollEventStamps = [];
  }

  const create_touch_handler = (callback: (pos: [number ,number]) => void) => {
    return (event: TouchEvent) => {
      callback([event.touches[0].clientX, event.touches[0].clientY]);
    }
  }

  const create_pointer_handler = (callback: (pos: [number ,number]) => void) => {
    return (event: PointerEvent) => {
      callback([event.clientX, event.clientY]);
    }
  }


  element.ontouchstart = create_touch_handler(handle_start);
  element.ontouchmove = create_touch_handler(handle_move);
  element.ontouchend = handle_end;
  element.onpointerdown = create_pointer_handler(handle_start);
  element.onpointermove = create_pointer_handler(handle_move);
  window.onpointerup = handle_end;


  return {
    ...readable(get(eventStore), (set) => {
      eventStore.subscribe(set);
    }),
    onScrollEnd: (callback: ScrollEndCallback) => {
      onScrollEndCallback = callback;
    }
  };
}