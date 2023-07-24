import type {Readable, Writable} from "svelte/store";
import {get, readable, writable} from "svelte/store";

export class AnimationHelper {
  private _targetValue: number = 0;
  private _currentValue: Writable<number> = writable(0);
  private _animationFrameStepId: number | null = null;

  public constructor() {
  }

  public get value(): Readable<number> {
    return readable(get(this._currentValue), set => {
      return this._currentValue.subscribe(set);
    });
  }

  public get animating(): Readable<boolean> {
    return readable(false, set => {
      this._currentValue.subscribe((value) => {
        set(value !== this._targetValue);
      });
    });
  }

  public setCurrentValue(value: number) {
    this._currentValue.set(value);
  }

  public animateTo(fromValue: number, targetValue: number, duration: number = 500): Promise<void> {
    this._currentValue.set(fromValue);
    this._targetValue = targetValue;
    if (get(this.animating) && this._animationFrameStepId != null) {
      window.cancelAnimationFrame(this._animationFrameStepId);
    }
    return this._animate(duration);
  }

  private _animate(duration: number) {
    const start = Date.now();
    const end = start + duration;
    const startValue = get(this._currentValue);
    const diff = this._targetValue - startValue;

    return new Promise<void>((resolve) => {
      const step = () => {
        const now = Date.now();
        const progress = Math.min(1, (now - start) / duration);
        const sined = Math.sin(progress * Math.PI / 2);
        const currentValue = startValue + diff * sined;
        this._currentValue.set(currentValue);
        if (now < end) {
          this._animationFrameStepId = window.requestAnimationFrame(step);
        } else {
          this._currentValue.set(this._targetValue);
          this._animationFrameStepId = null;
          resolve();
        }
      };
      this._animationFrameStepId = window.requestAnimationFrame(step);
    });
  }


}
