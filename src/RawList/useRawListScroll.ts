import * as React from 'react';
import type { ListyRef, ScrollAlign } from '../List';

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

  const applyScrollMargin = React.useCallback(
    (
      targetElement: HTMLElement,
      align: ScrollAlign,
      offset: number,
      isItem: boolean,
    ) => {
      const headerOffset =
        isItem && align === 'top' ? getStickyHeaderHeight(targetElement) : 0;

      targetElement.style.scrollMarginTop = `${headerOffset + offset}px`;
      targetElement.style.scrollMarginBottom = `${offset}px`;
    },
    [getStickyHeaderHeight],
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
        const { align = 'top', offset = 0 } = config;
        const isItem = 'key' in config;
        const targetKey = isItem ? config.key : config.groupKey;
        const targetElement = holder.querySelector<HTMLElement>(
          `[data-key="${CSS.escape(String(targetKey))}"]`,
        );

        if (targetElement) {
          applyScrollMargin(targetElement, align, offset, isItem);

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

      const { left, top } = config;
      if (left !== undefined) {
        holder.scrollLeft = left;
      }
      if (top !== undefined) {
        holder.scrollTop = top;
      }
    },
    [applyScrollMargin],
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
