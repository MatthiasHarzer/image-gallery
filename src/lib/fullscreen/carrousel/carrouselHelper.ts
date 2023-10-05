import {get, readable, type Readable, writable, type Writable} from "svelte/store";
import {
  createScrollObserver, type ScrollObserver
} from "../../../scripts/util/scrollObserver";
import {AnimationHelper} from "./animationHelper";
import {saveMod} from "../../../scripts/util/mod";
import type Image from "../../../scripts/gallery/image";

interface CarrouselScrollHelperParams {
  progress_to_next_image: number;
  speed_to_next_image: number;
  num_preload_images: number;
  animation_duration: number;
}

export class CarrouselHelper {

  public enabled: boolean = true;
  private readonly _scrollObserver: ScrollObserver;
  private readonly _index: Writable<number> = writable(0);
  private readonly _animationHelper: AnimationHelper = new AnimationHelper();
  private _scrollStartIndex: number = 0;

  public constructor(
      private _element: HTMLElement,
      _initialIndex: number,
      public readonly _images: Image[],
      private _config: CarrouselScrollHelperParams
  ) {
    this._scrollObserver = createScrollObserver(this._element, {
      uniDirectional: true,
    });
    this._scrollObserver.subscribe(this._onScroll.bind(this));
    this._scrollObserver.onScrollEnd(this._onScrollEnd.bind(this));
    this._scrollObserver.onScrollStart(this._onScrollStart.bind(this));


    this._index.subscribe(this._scrollToIndex.bind(this));

    this._setScrollXbyCenter(0)
  }

  private get _animationDuration(): number {
    return this._config.animation_duration;
  }

  private get _relativeZeroIndex(): number {
    return this._config.num_preload_images;
  }

  private get _relativeZeroOffset(): number {
    return this._elementWidth * this._relativeZeroIndex;
  }

  private get _elementWidth(): number {
    return this._element.clientWidth;
  }

  public get nonFractionalIndex(): Readable<number> {
    return readable(0, set => {
      this._index.subscribe((index) => {
        set(Math.round(index));
      });
    });
  }

  public get renderedImages(): Readable<Image[]> {
    return readable<Image[]>([], (set) => {
      this._index.subscribe((index) => {
        const rounded = Math.round(index);
        const images = [];
        for (let i = rounded - this._config.num_preload_images; i <= rounded + this._config.num_preload_images; i++) {
          images.push(this._images[saveMod(i, this._images.length)]);
        }
        set(images);
      });
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

  private async _animateToIndex(index: number) {
    return this._animationHelper.animate(get(this._index), index, this._animationDuration, this._index.set);
  }

  /**
   * Scrolls the carrousel to the given index, which may be fractional.
   * @param index
   * @private
   */
  private _scrollToIndex(index: number) {
    index = saveMod(index, this._images.length);
    const rounded = Math.round(index);
    const fraction = index - rounded;

    const targetOffset = this._elementWidth * fraction;

    this._setScrollXbyCenter(targetOffset);
  }


  /**
   * Set the scroll position relative to the center of the carrousel
   * @param {number} x
   * @private
   */
  private _setScrollXbyCenter(x: number) {
    const center = this._relativeZeroOffset; // may change in future
    this._element.scrollTo({
      left: center + x,
    });
  }

  private _onScrollStart() {
    this._scrollStartIndex = get(this.nonFractionalIndex);
  }

  private _onScroll({progressX}) {
    if (progressX == 0) return;
    const index = this._scrollStartIndex - progressX;
    this._index.set(index);
  }


  private _onScrollEnd([posX,], [speedX,]: [number, number], [progressX,]: [number, number]) {
    if (!this.enabled || posX == 0) return;

    const transition = Math.abs(progressX) > this._config.progress_to_next_image || Math.abs(speedX) > this._config.speed_to_next_image;
    const deltaIndex = -Math.sign(progressX);

    if (!transition) {
      this.setIndex(this._scrollStartIndex, true);
      return;
    }

    const noAnimation = (get(this.nonFractionalIndex) == this._images.length - 1 && deltaIndex > 0)
        || (get(this.nonFractionalIndex) == 0 && deltaIndex < 0); // TODO: Not ideal, but the best workaround for now

    const targetIndex = this._scrollStartIndex + deltaIndex;

    this.setIndex(targetIndex, true);
  }

  /**
   * Moves the carrousel to the next image. If smooth is true, the carrousel will animate to the new index.
   * @param smooth
   */
  public moveNext(smooth: boolean = true) {
    const targetIndex = saveMod(get(this.nonFractionalIndex) + 1, this._images.length);
    this.setIndex(targetIndex, smooth)
  }

  /**
   * Moves the carrousel to the previous image. If smooth is true, the carrousel will animate to the new index.
   * @param smooth
   */
  public movePrevious(smooth: boolean = true) {
    const targetIndex = saveMod(get(this.nonFractionalIndex) - 1, this._images.length);
    this.setIndex(targetIndex, smooth)
  }

  /**
   * Sets the index of the carrousel. If smooth is true, the carrousel will animate to the new index.
   * @param index The index to set
   * @param smooth Whether to animate to the new index
   * @param forceReset Whether to reset the index to 0 if the index is out of bounds
   */
  public setIndex(index: number, smooth: boolean = false, forceReset: boolean = false) {
    if(forceReset){
      this._index.set(saveMod(get(this.nonFractionalIndex)+ 1, this._images.length));
    }
    if (smooth) {
      return this._animateToIndex(index);
    } else {
      this._index.set(index);
    }
  }
}
