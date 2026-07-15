import * as React from 'react';
import { toTaggedKey } from '../util';
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

  const scrollTargetIntoView = React.useCallback(
    (
      targetElement: HTMLElement,
      align: ScrollAlign,
      offset: number,
      isItem: boolean,
    ) => {
      const headerOffset =
        isItem && align !== 'bottom' ? getStickyHeaderHeight(targetElement) : 0;

      const prevTop = targetElement.style.scrollMarginTop;
      const prevBottom = targetElement.style.scrollMarginBottom;

      targetElement.style.scrollMarginTop = `${headerOffset + offset}px`;
      targetElement.style.scrollMarginBottom = `${offset}px`;

      targetElement.scrollIntoView({
        block:
          align === 'bottom' ? 'end' : align === 'auto' ? 'nearest' : 'start',
        inline: 'nearest',
      });

      targetElement.style.scrollMarginTop = prevTop;
      targetElement.style.scrollMarginBottom = prevBottom;
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
        const { align = 'auto', offset = 0 } = config;
        const isItem = 'key' in config;
        const targetKey = isItem
          ? toTaggedKey(config.key, 'item')
          : toTaggedKey(config.groupKey, 'group');
        const targetElement = holder.querySelector<HTMLElement>(
          `[data-key="${CSS.escape(targetKey)}"]`,
        );

        if (targetElement) {
          scrollTargetIntoView(targetElement, align, offset, isItem);
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
    [scrollTargetIntoView],
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
