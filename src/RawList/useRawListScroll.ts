import * as React from 'react';
import type { ListRef, ScrollTo } from '@rc-component/virtual-list';

type ScrollConfig = NonNullable<Parameters<ScrollTo>[0]>;
type ScrollPositionConfig = Extract<ScrollConfig, { left?: number; top?: number }>;

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

      if ('key' in config) {
        const targetElement = holder.querySelector<HTMLElement>(
          `[data-key="${CSS.escape(String(config.key))}"]`,
        );

        if (targetElement) {
          const { align = 'top' } = config;
          targetElement.scrollIntoView({
            block:
              align === 'bottom'
                ? 'end'
                : align === 'auto'
                  ? 'nearest'
                  : 'start',
            inline: 'nearest',
          });
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
