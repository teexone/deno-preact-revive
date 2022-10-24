import { AnimationConfiguration, AnimationKeyframe, AnimationMultiPropertyConfiguration, AnimationProperty, Animator, NoInitialKeyframe } from "../types.ts";
import {values, isArray} from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';
import lerp from "../utils/lerp.ts";

type StyleAnimatorTarget = HTMLElement | SVGElement | { style: CSSStyleDeclaration };

/**
 * Style Animator animates style properties for supplied target objects.
 * Works with HTML/SVG elements
 */
export default class StyleAnimator implements Animator {

    private target: () => StyleAnimatorTarget | StyleAnimatorTarget[]; // Stylable elements 
    private time: DOMHighResTimeStamp|null = null;
    private animation: AnimationMultiPropertyConfiguration|null = null;
    private active: boolean = false;

    private getTarget() {
        let target = this.target();
        if (!isArray(target)) {
            target = [ target ]
        }
        return target;
    }

    constructor(target: () => StyleAnimatorTarget | StyleAnimatorTarget[]) {    
        this.target = target;
    }

    private frame(time: DOMHighResTimeStamp) {
        if (this.animation == null)
            return
        if (this.time == null) {
            this.time = time;
        }

        const delta_ms = time - this.time;
        const scaled = delta_ms / this.animation.duration;
        if (scaled > 1 + Number.EPSILON) {
            return
        }
        this.animate(scaled)
    }

    bind(animation: AnimationConfiguration): void {
        if (animation.keyframes) {
            if (isArray(animation.keyframes)) {
                if (!animation.keyframes.some(x => x[0] == 0)) {
                    throw NoInitialKeyframe;
                }
                let keyframes: Record<AnimationProperty, AnimationKeyframe[]> = {}
                if (isArray(animation.property)) {
                    for (const property in animation.property) {
                        keyframes[property] = animation.keyframes;
                    }
                } else {
                    keyframes = {[animation.property]: animation.keyframes}
                    animation.property = [animation.property]
                }
                animation.keyframes = keyframes;
            } else values(animation.keyframes).forEach((x: AnimationKeyframe[]) => {
                if (!x.some(y => y[0] == 0)) {
                    throw NoInitialKeyframe;
                }
                if (values(animation.keyframes).length < animation.property.length) {
                    throw Error("Not all properties have keyframes")
                }
            })
        }
        this.animation = animation as AnimationMultiPropertyConfiguration;
    }

    beginLoop(): void {
        this.active = true;
        const frameCallback = (t: DOMHighResTimeStamp) => {
            this.frame(t);            
            if (this.active) {
                window.requestAnimationFrame(frameCallback)
            }
        }
        window.requestAnimationFrame(frameCallback);
    }

    endLoop(): void {
        this.active = false;
    }

    animate(time: number): void {
        if (this.animation == null) {
            return
        }
        for (const property of this.animation.property) {
            let l = 0, r = this.animation.keyframes[property].length - 1;
            while (r - l > 1) {
                let m = ( r + l ) >> 1;
                if (this.animation.keyframes[property][m][0] - Number.EPSILON >= time) 
                    r = m
                else l = m;
            }
            const x = this.animation.keyframes[property][l][1] as number;
            const y = this.animation.keyframes[property][r][1] as number;
            const t_diff = this.animation.keyframes[property][r][0] - this.animation.keyframes[property][l][0];
            const value = lerp(x, y, (time - this.animation.keyframes[property][l][0]) / t_diff)
            for (const element of this.getTarget()) {
                element.style.setProperty(property, value.toString())
            }
        }
    }
}