import * as React from 'react';
import Portal from '@rc-component/portal';
import type { ListRef } from 'rc-virtual-list';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';
import type { Group } from '../interface';

export interface StickyHeaderParams<T, K extends React.Key = React.Key> {
  enabled: boolean;
  group: Group<T, K> | undefined;
  headerRows: { groupKey: K; rowIndex: number }[];
  groupKeyToItems: Map<K, T[]>;
  containerRef: React.RefObject<HTMLDivElement>;
  listRef: React.RefObject<ListRef>;
  prefixCls: string;
}

export default function useStickyGroupHeader<
  T,
  K extends React.Key = React.Key,
>(params: StickyHeaderParams<T, K>) {
  const {
    enabled,
    group,
    headerRows,
    groupKeyToItems,
    containerRef,
    listRef,
    prefixCls,
  } = params;

  const lastHeaderIdxRef = React.useRef(0);

  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { virtual } = info;

      if (!enabled || !headerRows.length || !virtual) {
        lastHeaderIdxRef.current = 0;
        return null;
      }

      // maybe rc-virtual-list will expose scrollTop in the future
      const getHolderScrollTop = () => {
        const container = containerRef.current;
        const holder =
          container?.querySelector<HTMLDivElement>('.rc-virtual-list-holder') ||
          listRef.current?.nativeElement?.querySelector?.(
            '.rc-virtual-list-holder',
          );
        if (holder) {
          return holder.scrollTop;
        }
        const infoScrollTop = listRef.current?.getScrollInfo?.().y;
        return infoScrollTop;
      };

      const resolveByScrollTop = (scrollTop: number) => {
        const cachedIdx = lastHeaderIdxRef.current;
        const cachedRow = headerRows[cachedIdx];
        const cachedTop = cachedRow
          ? info.getSize(cachedRow.groupKey).top
          : null;
        const nextRow = headerRows[cachedIdx + 1];
        const nextTop = nextRow ? info.getSize(nextRow.groupKey).top : null;

        if (
          cachedRow &&
          cachedTop !== null &&
          scrollTop >= cachedTop &&
          (nextTop === null || scrollTop < nextTop)
        ) {
          return cachedIdx;
        }

        let lo = 0;
        let hi = headerRows.length - 1;
        let candidate = 0;

        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          const { top } = info.getSize(headerRows[mid].groupKey);
          if (top <= scrollTop) {
            candidate = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        return candidate;
      };

      const scrollTop = getHolderScrollTop();
      const activeHeaderIdx = resolveByScrollTop(scrollTop);

      lastHeaderIdxRef.current = activeHeaderIdx;

      const currHeader = headerRows[activeHeaderIdx];
      const groupItems = groupKeyToItems.get(currHeader.groupKey) || [];

      const headerNode = (
        <div className={`${prefixCls}-sticky-header`}>
          {group.title(currHeader.groupKey, groupItems)}
        </div>
      );

      return (
        <Portal open getContainer={() => containerRef.current}>
          {headerNode}
        </Portal>
      );
    },
    [
      enabled,
      group,
      headerRows,
      groupKeyToItems,
      containerRef,
      listRef,
      prefixCls,
    ],
  );

  return extraRender;
}
