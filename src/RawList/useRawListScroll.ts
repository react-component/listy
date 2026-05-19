import * as React from 'react';
import type { ListRef, ScrollTo } from '@rc-component/virtual-list';

type ScrollConfig = NonNullable<Parameters<ScrollTo>[0]>;
type ScrollPositionConfig = Extract<ScrollConfig, { left?: number; top?: number }>;
type ScrollKeyConfig = Extract<ScrollConfig, { key: React.Key }>;

function isScrollKeyConfig(config: ScrollConfig): config is ScrollKeyConfig {
  return typeof config === 'object' && 'key' in config;
}

function findDataElement(container: HTMLElement, value: React.Key) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-key]')).find(
    element => element.dataset.key === String(value),
  );
}

function getScrollIntoViewOptions(
  align: ScrollKeyConfig['align'] = 'top',
): ScrollIntoViewOptions {
  return {
    block:
      align === 'bottom' ? 'end' : align === 'auto' ? 'nearest' : 'start',
    inline: 'nearest',
  };
}

export default function useRawListScroll(ref: React.Ref<ListRef>) {
  const holderRef = React.useRef<HTMLDivElement>(null);

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
          targetElement.scrollIntoView(getScrollIntoViewOptions(config.align));
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
    [],
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
