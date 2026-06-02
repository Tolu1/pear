import type { Image } from '../memory/image';
import type { WebAction } from './types';

export interface TabInfo {
  index: number;
  url: string;
  title: string;
}

export interface TabState {
  activeTab: number;
  tabs: TabInfo[];
}

export interface ScreenshotOptions {
  fullPage?: boolean;
}

export interface ClickOptions {
  transform?: boolean;
}

export interface WebHarnessLike {
  start(): Promise<void>;
  stop(): Promise<void>;

  screenshot(options?: ScreenshotOptions): Promise<Image>;
  retrieveTabState(): Promise<TabState>;

  click(coord: { x: number; y: number }, options?: ClickOptions): Promise<void>;
  doubleClick(coord: { x: number; y: number }, options?: ClickOptions): Promise<void>;
  rightClick(coord: { x: number; y: number }, options?: ClickOptions): Promise<void>;
  drag(
    coords: { x1: number; y1: number; x2: number; y2: number },
    options?: ClickOptions,
  ): Promise<void>;

  type(input: { content: string }): Promise<void>;
  clickAndType(
    input: { x: number; y: number; content: string },
    options?: ClickOptions,
  ): Promise<void>;
  scroll(
    input: { x: number; y: number; deltaX: number; deltaY: number },
    options?: ClickOptions,
  ): Promise<void>;

  enter(): Promise<void>;
  tab(): Promise<void>;
  backspace(): Promise<void>;
  selectAll(): Promise<void>;

  switchTab(input: { index: number }): Promise<void>;
  newTab(): Promise<void>;
  navigate(url: string): Promise<void>;
  goBack(): Promise<void>;

  executeAction(action: WebAction): Promise<void>;
  waitForStability(timeout?: number): Promise<void>;
}
