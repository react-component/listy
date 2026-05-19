import * as React from 'react';
import type { ListRef, ScrollTo } from '@rc-component/virtual-list';

type ScrollConfig = NonNullable<Parameters<ScrollTo>[0]>;
type ScrollPositionConfig = Extract<ScrollConfig, { left?: number; top?: number }>;
type ScrollKeyConfig = Extract<ScrollConfig, { key: React.Key }>;

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

function findDataElement(
  container: HTMLElement,
  value: React.Key,
) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-key]')).find(
    element => element.dataset.key === String(value),
  );
}

export default function useRawListScroll(ref: React.Ref<ListRef>) {
  const holderRef = React.useRef<HTMLDivElement>(null);

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

      if (isScrollKeyConfig(config)) {
        const targetElement = findDataElement(holder, config.key);

        if (targetElement) {
          scrollToElement(targetElement, config.align, config.offset);
        }
        return;
      }

      const { left, top } = config as ScrollPositionConfig;
      if (left !== undefined) {
        holder.scrollLeft = left;
      }
      if (top !== undefined) {
        holder.scrollTop = top;
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

  return holderRef;
}
