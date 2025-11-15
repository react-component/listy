import * as React from 'react';
import Portal from '@rc-component/portal';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';
import type { Group } from '../interface';

export interface StickyHeaderParams<T> {
  enabled: boolean;
  group: Group<T> | undefined;
  headerRows: Array<{ groupKey: React.Key; rowIndex: number }>;
  groupKeyToItems: Map<React.Key, T[]>;
  containerRef: React.RefObject<HTMLDivElement>;
  prefixCls: string;
}

export default function useStickyGroupHeader<T>(params: StickyHeaderParams<T>) {
  const {
    enabled,
    group,
    headerRows,
    groupKeyToItems,
    containerRef,
    prefixCls,
  } = params;

  const lastHeaderIdxRef = React.useRef(0);

  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { start, virtual } = info;

      if (!enabled || !headerRows.length || !virtual) {
        lastHeaderIdxRef.current = 0;
        return null;
      }

      const activeHeaderIdx = (() => {
        // Fast path: reuse previously resolved header index if start still
        // points within the same header block.
        const cachedIdx = lastHeaderIdxRef.current;
        const cachedRow = headerRows[cachedIdx];
        const nextRow = headerRows[cachedIdx + 1];
        if (
          cachedRow &&
          cachedRow.rowIndex <= start &&
          (!nextRow || nextRow.rowIndex > start)
        ) {
          return cachedIdx;
        }

        // Binary search to find the closest header whose rowIndex <= start.
        let lo = 0;
        let hi = headerRows.length - 1;
        let candidate = 0;

        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (headerRows[mid].rowIndex <= start) {
            candidate = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        return candidate;
      })();

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
      prefixCls,
    ],
  );

  return extraRender;
}
