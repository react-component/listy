import * as React from 'react';
import type { ListyRef, PositionScrollToConfig, ScrollAlign } from '../List';

export default function useRawListScroll(
  ref: React.Ref<ListyRef>,
  prefixCls: string,
  stickyGroup: boolean,
) {
  // =============================== Refs ===============================
  const holderRef = React.useRef<HTMLDivElement>(null);

  // ============================== Utils ===============================
  const getStickyHeaderHeight = React.useCallback(
    (targetElement: HTMLElement) => {
      if (!stickyGroup) {
        return 0;
      }

      const groupSection = targetElement.closest<HTMLElement>(
        `.${CSS.escape(`${prefixCls}-group-section`)}`,
      );
      const groupHeader = groupSection?.querySelector<HTMLElement>(
        `.${CSS.escape(`${prefixCls}-group-header`)}`,
      );

      if (!groupHeader) {
        return 0;
      }

      const rect = groupHeader.getBoundingClientRect();
      const height =
        rect.height || rect.bottom - rect.top || groupHeader.offsetHeight;

      return Number.isFinite(height) ? height : 0;
    },
    [prefixCls, stickyGroup],
  );

  const setTargetScrollMargin = React.useCallback(
    (targetElement: HTMLElement, align: ScrollAlign) => {
      const marginTop =
        align === 'top' ? getStickyHeaderHeight(targetElement) : 0;

      targetElement.style.setProperty(
        `--${prefixCls}-item-scroll-margin-top`,
        `${marginTop}px`,
      );
    },
    [getStickyHeaderHeight, prefixCls],
  );

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
        const { align = 'top' } = config;
        const targetKey = 'groupKey' in config ? config.groupKey : config.key;
        const targetElement = holder.querySelector<HTMLElement>(
          `[data-key="${CSS.escape(String(targetKey))}"]`,
        );

        if (targetElement) {
          if ('key' in config) {
            setTargetScrollMargin(targetElement, align);
          }

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
    [setTargetScrollMargin],
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
