import * as React from 'react';
import type { ListyRef, PositionScrollToConfig } from '../List';

export default function useRawListScroll(ref: React.Ref<ListyRef>) {
  // =============================== Refs ===============================
  const holderRef = React.useRef<HTMLDivElement>(null);

  // ============================== Scroll ==============================
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

  // ============================ Imperative ============================
  React.useImperativeHandle(
    ref,
    () => ({
      scrollTo,
    }),
    [scrollTo],
  );

  // ============================== Return ==============================
  return holderRef;
}
