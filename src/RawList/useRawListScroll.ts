import * as React from 'react';
import type { ListyRef, PositionScrollToConfig } from '../interface';

export default function useRawListScroll(ref: React.Ref<ListyRef>) {
  const holderRef = React.useRef<HTMLDivElement>(null);

  const scrollTo: ListyRef['scrollTo'] = React.useCallback(
    (config) => {
      const holder = holderRef.current;
      if (!holder || config == null) {
        return;
      }

      if (typeof config === 'number') {
        holder.scrollTop = config;
        return;
      }

      if ('key' in config || 'groupKey' in config) {
        const targetKey = 'groupKey' in config ? config.groupKey : config.key;
        const targetElement = holder.querySelector<HTMLElement>(
          `[data-key="${CSS.escape(String(targetKey))}"]`,
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

      const { left, top } = config as PositionScrollToConfig;
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
      scrollTo,
    }),
    [scrollTo],
  );

  return holderRef;
}
