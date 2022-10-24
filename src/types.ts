
export type AnimationProperty = string;

export type AnimationPropertyValue = string | number;

export type AnimationKeyframe = [number, AnimationPropertyValue]

export type AnimationConfiguration = AnimationSinglePropertyConfiguration | AnimationMultiPropertyConfiguration;

export type AnimationSinglePropertyConfiguration = {
    property: AnimationProperty;
    keyframes: AnimationKeyframe[];
    duration: number;
}

export type AnimationMultiPropertyConfiguration = {
    property: AnimationProperty[];
    keyframes: Record<AnimationProperty, AnimationKeyframe[]>;
    duration: number;
}

export interface Animator {
    bind(animation: AnimationConfiguration): void;
    animate(time: number): void;
    beginLoop(): void;
    endLoop(): void;
}

export class NoInitialKeyframe implements Error {
    name = "NoInitialKeyframe"
    message = "Animation requires the presence of keyframe with t=0"
}