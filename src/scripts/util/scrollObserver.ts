import type {Readable, Writable} from "svelte/store";
import {get, readable, writable} from "svelte/store";

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

  /**
   * If true, the scroll observer will not emit events when the user scrolls using a pointer device.
   */
  disablePointerSupport?: boolean;
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
type Progress = [x: number, y: number];
type Position = [x: number, y: number];
type ScrollEndCallback = (pos: ScrollDelta, speed: ScrollSpeed, progress: Progress) => void;

/**
 * A scroll observer, which emits events whenever the user scrolls inside the observed element.
 */
export type ScrollObserver = Readable<ScrollObserverEvent> & {
  onScrollStart: (callback: (pos: Position) => void) => void;
  onScrollEnd: (callback: ScrollEndCallback) => void;
  onClick: (callback: (pos: Position, progress: Progress) => void) => void;
  onScrollFrame: (callback: (delta: ScrollDelta) => void) => void;
};

const createEmptyScrollObserver = (): ScrollObserver => {
  return {
    ...readable(defaultScrollEvent),
    onScrollEnd: () => {
    },
    onClick: () => {

    },
    onScrollFrame: () => {
    },
    onScrollStart: () => {},
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
  let lastFramePosition: Position = [0, 0];
  let frameDelta: ScrollDelta = [0, 0];
  let initialScrollDirection: ScrollDirection | null = null;
  let scrollEventStamps: ScrollEventStamp[] = [];
  let onClickCallback: (pos: Position, progress: Progress) => void = null;
  let onScrollStartCallback: (pos: Position) => void = null;
  let pointerTouchDown = false;
  const uniDirectional = params?.uniDirectional ?? false;
  const disablePointerSupport = params?.disablePointerSupport ?? false;
  const eventStore: Writable<ScrollObserverEvent> = writable(defaultScrollEvent);
  const frameEventStore: Writable<ScrollDelta> = writable([0, 0]);
  const clientDimensions = [element.clientWidth, element.clientHeight];

  const get_delta = (): ScrollDelta => {
    if (!uniDirectional)
      return deltaPosition;

    return [
      initialScrollDirection == ScrollDirection.Vertical ? 0 : deltaPosition[0],
      initialScrollDirection == ScrollDirection.Horizontal ? 0 : deltaPosition[1]
    ]
  }

  const get_frame_delta = (pos: Position): ScrollDelta => {
    const delta: ScrollDelta = [
      pos[0] - lastFramePosition[0],
      pos[1] - lastFramePosition[1]
    ]
    if (!uniDirectional)
      return delta;

    return [
      initialScrollDirection == ScrollDirection.Vertical ? 0 : delta[0],
      initialScrollDirection == ScrollDirection.Horizontal ? 0 : delta[1]
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

  const get_progress = (position: ScrollDelta): Progress => {
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
    frameEventStore.set(frameDelta);

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
    lastFramePosition = pos;
    onScrollStartCallback && onScrollStartCallback(pos);
    update();
  }

  const handle_move = (pos: [number, number]) => {
    if (!pointerTouchDown) return;
    deltaPosition = [
      pos[0] - startPosition[0],
      pos[1] - startPosition[1]
    ]

    const distance = Math.sqrt(Math.pow(deltaPosition[0], 2) + Math.pow(deltaPosition[1], 2));

    if (initialScrollDirection == null && distance > 10) {
      const abs_delta_x = Math.abs(deltaPosition[0]);
      const abs_delta_y = Math.abs(deltaPosition[1]);
      if (abs_delta_x > abs_delta_y) {
        initialScrollDirection = ScrollDirection.Horizontal;
      } else {
        initialScrollDirection = ScrollDirection.Vertical;
      }
    }

    frameDelta = get_frame_delta(pos);

    update();

    lastFramePosition = pos;
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

  const handle_click = (pos: [number, number]) => {
    if (onClickCallback == null) return;
    onClickCallback(pos, get_progress([pos[0], pos[1]]));
  }

  const create_touch_handler = (callback: (pos: [number, number]) => void) => {
    return (event: TouchEvent) => {
      callback([event.touches[0].clientX, event.touches[0].clientY]);
    }
  }

  const create_pointer_handler = (callback: (pos: [number, number]) => void) => {
    return (event: PointerEvent) => {
      callback([event.clientX, event.clientY]);
    }
  }


  element.ontouchstart = create_touch_handler(handle_start);
  element.ontouchmove = create_touch_handler(handle_move);
  element.ontouchend = handle_end;

  if (!disablePointerSupport) {
    element.onpointerdown = create_pointer_handler(handle_start);
    element.onpointermove = create_pointer_handler(handle_move);
    window.onpointerup = handle_end;
  }

  element.onclick = (event: MouseEvent) => handle_click([event.clientX, event.clientY])

  return {
    ...readable(get(eventStore), (set) => {
      eventStore.subscribe(set);
    }),
    onScrollEnd: (callback: ScrollEndCallback) => {
      onScrollEndCallback = callback;
    },
    onClick: (callback: (pos: Position, progress: Progress) => void) => {
      onClickCallback = callback;
    },
    onScrollFrame: (callback: (delta: ScrollDelta) => void) => {
      frameEventStore.subscribe(callback);
    },
    onScrollStart: (callback: (pos: Position) => void) => {
      onScrollStartCallback = callback;
    }
  };
}
