import {get, readable, type Readable, writable, type Writable} from "svelte/store";
import {
  createScrollObserver, type ScrollObserver, type ScrollObserverEvent
} from "../../../scripts/util/scrollObserver";
import {AnimationHelper} from "./animationHelper";

interface CarrouselScrollHelperParams {
  progress_to_next_image: number;
  speed_to_next_image: number;
}

export class CarrouselScrollHelper {
  public enabled: boolean = true;
  private readonly _scrollObserver: ScrollObserver;
  private readonly _index: Writable<number> = writable(0);
  private readonly _animationHelper: AnimationHelper = new AnimationHelper();

  public constructor(private _element: HTMLElement, _initialIndex: number, private _config: CarrouselScrollHelperParams) {
    this._scrollObserver = createScrollObserver(this._element, {
      uniDirectional: true,
    });
    this._scrollObserver.onScrollEnd(this._onScrollEnd.bind(this));
    this._scrollObserver.subscribe(this._onScroll.bind(this));

    this._index = writable(_initialIndex);
    this._animationHelper.value.subscribe(this._scrollToAbs.bind(this));
    this._scrollToAbs(this._currentIndexTargetOffset);
    window.addEventListener("resize", () => {
      this._scrollToAbs(this._currentIndexTargetOffset);
    });
  }

  public get sliding(): Readable<boolean> {
    return readable(false, set => {
      this._scrollObserver.subscribe((e) => {
        set(e.direction != null);
      });
    });
  }

  public get observer(): ScrollObserver {
    return this._scrollObserver;
  }

  public get index(): Readable<number> {
    return readable(get(this._index), set => {
      return this._index.subscribe(set);
    });
  }

  private get _currentIndexTargetOffset(): number {
    return this._element.clientWidth * get(this._index);
  }

  private get _currentScrollOffset(): number {
    return this._element.scrollLeft;
  }

  public moveNext() {
    if (this._currentScrollOffset === this._element.scrollWidth - this._element.clientWidth) return;
    this.setIndex(get(this._index) + 1, true);
  }

  public movePrevious() {
    if (get(this._index) === 0) return;
    this.setIndex(get(this._index) - 1, true);
  }

  /**
   * Sets the index of the carrousel. If smooth is true, the carrousel will animate to the new index.
   * @param index The index to set
   * @param smooth Whether to animate to the new index
   */
  public setIndex(index: number, smooth: boolean = false) {
    this._index.set(index);
    if (smooth) {
      this._animationHelper.animateTo(this._currentScrollOffset, this._currentIndexTargetOffset, 300);
    } else {
      this._scrollToAbs(this._currentIndexTargetOffset);
    }
    // this.scrollToIndex(index, smooth);
  }


  private _scrollToAbs(x: number) {
    this._element.scrollTo({
      left: x,
    });
  }

  private _onScrollEnd(_, [speedX,]: [number, number], [progressX,]: [number, number]) {
    if (!this.enabled) return;

    const transition = Math.abs(progressX) > this._config.progress_to_next_image || Math.abs(speedX) > this._config.speed_to_next_image;
    const deltaIndex = -Math.sign(progressX);

    if (!transition) {
      this.setIndex(get(this._index), true);
      return;
    }

    if (deltaIndex > 0) {
      this.moveNext();
    }else{
      this.movePrevious();
    }
  }

  private _onScroll({deltaX}: ScrollObserverEvent) {
    if (!this.enabled || get(this._animationHelper.animating)) return;
    this._scrollToAbs(this._currentIndexTargetOffset - deltaX);
  }
}
