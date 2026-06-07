import { SwitchTabWebAction } from "@/web/types";

export interface Action {
    variant: string,
    [key: string]: any
}

export type ActionIntent = ClickIntent | TypeIntent | ScrollIntent | SwitchTabIntent;
export type Intent = ActionIntent | CheckIntent;

export interface ClickIntent {
    variant: 'click';
    target: string;
}

export interface TypeIntent {
    variant: 'type';
    target: string;
    content: string;
}

export interface ScrollIntent {
    variant: 'scroll';
    target: string;
    deltaX: number;
    deltaY: number;
}

export type SwitchTabIntent = SwitchTabWebAction;

export interface CheckIntent {
    variant: 'check';
    checks: string[];
}
