export type Base64Image = `data:image/${'jpeg' | 'png' | 'gif'};base64,${string}`;

export type WebAction = NavigateWebAction | ClickWebAction | TypeWebAction | ScrollWebAction | SwitchTabWebAction;

export interface NavigateWebAction {
    variant: 'load'
    url: string
}

export interface ClickWebAction {
    variant: 'click'
    x: number
    y: number
}

export interface TypeWebAction {
    variant: 'type'
    x: number
    y: number
    content: string
}

export interface ScrollWebAction {
    variant: 'scroll',
    x: number,
    y: number,
    deltaX: number,
    deltaY: number
}

export type SwitchTabWebAction = {
    variant: 'tab',
    index: number
}

export interface PixelCoordinate {
    x: number,
    y: number
}
