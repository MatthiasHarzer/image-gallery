import {get, readable, type Readable, writable, type Writable} from "svelte/store";
import {
  createScrollObserver, type ScrollObserver, type ScrollObserverEvent
} from "../../../scripts/util/scrollObserver";
import {AnimationHelper} from "./animationHelper";
import {saveMod} from "../../../scripts/util/mod";
import type Image from "../../../scripts/gallery/image";

interface CarrouselScrollHelperParams {
  progress_to_next_image: number;
  speed_to_next_image: number;
  num_preload_images: number;
}

export class CarrouselScrollHelper {
  public enabled: boolean = true;
  private readonly _scrollObserver: ScrollObserver;
  private readonly _index: Writable<number> = writable(0);
  private readonly _animationHelper: AnimationHelper = new AnimationHelper();

  public constructor(private _element: HTMLElement, _initialIndex: number, public readonly _images: Image[], private _config: CarrouselScrollHelperParams) {
    this._scrollObserver = createScrollObserver(this._element, {
      uniDirectional: true,
    });
    this._scrollObserver.onScrollEnd(this._onScrollEnd.bind(this));
    this._scrollObserver.subscribe(this._onScroll.bind(this));

    this._index = writable(_initialIndex);

    this._animationHelper.value.subscribe(this._scrollToAbs.bind(this));

    this.setIndex(_initialIndex, false);
    window.addEventListener("resize", () => {
      this.setIndex(_initialIndex, false);
    });
  }

  private get _numElements(): number {
    return this._images.length;
  }

  private get _relativeZeroIndex(): number {
    return this._config.num_preload_images;
  }

  private get _relativeZeroOffset(): number {
    return this._element.clientWidth * this._relativeZeroIndex;
  }

  private _renderedImages(index: number): Image[] {
    const images = [];
    for (let i = index - this._config.num_preload_images; i <= index + this._config.num_preload_images; i++) {
      images.push(this._images[saveMod(i, this._images.length)]);
    }
    return images;
  }

  public get images(): Readable<Image[]> {
    return readable(this._renderedImages(get(this._index)), set => {
      this._index.subscribe((index) => {
        set(this._renderedImages(index));
      });
    })
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
    return readable(get(this._index), this._index.subscribe);
  }

  private get _currentIndexTargetOffset(): number {
    return this._element.clientWidth * this._relativeZeroIndex;
  }

  private get _currentScrollOffset(): number {
    return this._element.scrollLeft;
  }

  public moveNext() {
    const targetIndex = saveMod(get(this.index) + 1, this._numElements);
    this.setIndex(targetIndex, true)
  }

  public movePrevious() {
    const targetIndex = saveMod(get(this.index) - 1, this._numElements);
    this.setIndex(targetIndex, true)
  }

  private _getTargetOffset(newIndex: number): number {
    const diff = get(this.index) - newIndex;

    if (Math.abs(diff) > this._numElements / 2) {
      return this._element.clientWidth * (this._relativeZeroIndex + Math.sign(diff) * (this._numElements - Math.abs(diff)));
    } else {
      return this._element.clientWidth * (this._relativeZeroIndex - diff);
    }
  }



  private reset() {
    this._scrollToAbs(this._relativeZeroOffset);
  }

  /**
   * Sets the index of the carrousel. If smooth is true, the carrousel will animate to the new index.
   * @param index The index to set
   * @param smooth Whether to animate to the new index
   */
  public setIndex(index: number, smooth: boolean = false) {

    const diff = index - get(this.index);

    if (Math.abs(diff) > this._numElements / 2) {
      this._index.set(index);
      this.reset();
      return;
    }

    const targetOffset = this._getTargetOffset(index);

    this._moveTo(targetOffset, smooth).then(()=>{
      this._index.set(index);
      this.reset();
    });

  }

  private _moveTo(targetOffset: number, smooth: boolean = false): Promise<void> {
    if (smooth) {
      return this._animationHelper.animateTo(this._currentScrollOffset, targetOffset, 300);
    } else {
      this._scrollToAbs(targetOffset);
      return Promise.resolve();
    }
  }


  private _scrollToAbs(x: number) {
    this._element.scrollTo({
      left: x,
    });
  }

  private _onScrollEnd([posX,], [speedX,]: [number, number], [progressX,]: [number, number]) {
    if (!this.enabled || posX == 0) return;

    const transition = Math.abs(progressX) > this._config.progress_to_next_image || Math.abs(speedX) > this._config.speed_to_next_image;
    const deltaIndex = -Math.sign(progressX);

    if (!transition) {
      this.setIndex(get(this.index), true);
      return;
    }

    if (deltaIndex > 0) {
      this.moveNext();
    } else {
      this.movePrevious();
    }
  }

  private _onScroll({deltaX}: ScrollObserverEvent) {
    if (!this.enabled || get(this._animationHelper.animating)) return;
    this._scrollToAbs(this._currentIndexTargetOffset - deltaX);
  }
}
