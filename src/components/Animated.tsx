import set from "https://deno.land/x/lodash@4.17.15-es/set.js";
import values from "https://deno.land/x/lodash@4.17.15-es/values.js";
import { Component, ComponentChildren, Fragment,toChildArray, cloneElement } from "preact"
import StyleAnimator from "../animators/StyleAnimator.ts";
import { AnimationConfiguration, Animator } from "../types.ts"


type AnimatedProps = {
    animation: AnimationConfiguration;
    children: ComponentChildren;
    animator?: Animator;
}


export default class Animated extends Component<AnimatedProps, {}> {
    
    refs: Record<string|number, HTMLElement | SVGElement> = {};

    constructor(props: AnimatedProps) {
        super(props)

        if (this.props.animator == undefined) {
            this.props.animator = new StyleAnimator(() => values(this.refs))
        }
    }

    setRef(child: string|number, ref: HTMLElement|SVGElement) {
        set(this.refs, child.toString(), ref);
    }

    componentDidMount() {
        this.props.animator?.bind(this.props.animation);
        this.props.animator?.beginLoop();
    }

    componentWillUnmount() {
        this.props.animator?.endLoop();
    }

    render() {
        return (
            <Fragment>
                {
                    toChildArray(this.props.children).map((child, index) => {
                        if (typeof child == "number" || typeof child == "string") {
                            return child
                        } else {
                            return cloneElement(child, {
                                ref: (ref: HTMLElement|SVGElement) => this.setRef(index, ref),
                            })
                        }
                    })
                }
            </Fragment>
        )
    }
}