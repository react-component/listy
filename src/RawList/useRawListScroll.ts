import * as React from 'react';
import type { ListRef, ScrollTo } from '@rc-component/virtual-list';

type ScrollConfig = NonNullable<Parameters<ScrollTo>[0]>;
type ScrollPositionConfig = Extract<ScrollConfig, { left?: number; top?: number }>;
type ScrollKeyConfig = Extract<ScrollConfig, { key: React.Key }>;

function isScrollPositionConfig(
  config: ScrollConfig,
): config is ScrollPositionConfig {
  return typeof config === 'object' && ('left' in config || 'top' in config);
}

function isScrollKeyConfig(config: ScrollConfig): config is ScrollKeyConfig {
  return typeof config === 'object' && 'key' in config;
}

function getElementTop(container: HTMLElement, element: HTMLElement) {
  return (
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop
  );
}

export default function useRawListScroll(ref: React.Ref<ListRef>) {
  const holderRef = React.useRef<HTMLDivElement>(null);
  const keyElementMapRef = React.useRef(new Map<React.Key, HTMLElement>());
  const indexElementMapRef = React.useRef(new Map<number, HTMLElement>());

  const registerElement = React.useCallback(
    (key: React.Key, rowIndex: number, element: HTMLElement | null) => {
      if (element) {
        keyElementMapRef.current.set(key, element);
        indexElementMapRef.current.set(rowIndex, element);
      } else {
        keyElementMapRef.current.delete(key);
        indexElementMapRef.current.delete(rowIndex);
      }
    },
    [],
  );

  const scrollToElement = React.useCallback(
    (
      element: HTMLElement,
      align: 'top' | 'bottom' | 'auto' = 'top',
      offset = 0,
    ) => {
      const holder = holderRef.current as HTMLDivElement;

      const elementTop = getElementTop(holder, element);
      const elementBottom = elementTop + element.offsetHeight;
      const scrollBottom = holder.scrollTop + holder.clientHeight;

      if (align === 'auto') {
        if (elementTop < holder.scrollTop) {
          holder.scrollTop = elementTop - offset;
        } else if (elementBottom > scrollBottom) {
          holder.scrollTop = elementBottom - holder.clientHeight + offset;
        }
        return;
      }

      holder.scrollTop =
        align === 'bottom'
          ? elementBottom - holder.clientHeight + offset
          : elementTop - offset;
    },
    [],
  );

  const scrollTo: ScrollTo = React.useCallback(
    (config) => {
      const holder = holderRef.current;
      if (!holder || config == null) {
        return;
      }

      if (typeof config === 'number') {
        holder.scrollTop = config;
        return;
      }

      if (isScrollPositionConfig(config)) {
        if (config.left !== undefined) {
          holder.scrollLeft = config.left;
        }
        if (config.top !== undefined) {
          holder.scrollTop = config.top;
        }
        return;
      }

      const targetElement = isScrollKeyConfig(config)
        ? keyElementMapRef.current.get(config.key)
        : indexElementMapRef.current.get(config.index);

      if (targetElement) {
        scrollToElement(targetElement, config.align, config.offset);
      }
    },
    [scrollToElement],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      nativeElement: holderRef.current as HTMLDivElement,
      scrollTo,
      getScrollInfo: () => ({
        x: holderRef.current?.scrollLeft || 0,
        y: holderRef.current?.scrollTop || 0,
      }),
    }),
    [scrollTo],
  );

  return {
    holderRef,
    registerElement,
  };
}
