import * as React from 'react';
import type { ListProps as VirtualListProps } from '@rc-component/virtual-list';
import type { Group } from '../hooks/useGroupSegments';
import GroupHeader from '../GroupHeader';

// ============================== Types ===============================
type ExtraRenderInfo = Parameters<
  NonNullable<VirtualListProps<unknown>['extraRender']>
>[0];

type HeaderRow<K extends React.Key> = { groupKey: K; rowIndex: number };

// ============================== Utils ===============================
// `headerRows` is sorted by rowIndex. Find the last header not after `start`.
function findActiveHeaderIndex<K extends React.Key>(
  headerRows: HeaderRow<K>[],
  start: number,
) {
  let left = 0;
  let right = headerRows.length - 1;
  let activeIndex = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (headerRows[mid].rowIndex <= start) {
      activeIndex = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return activeIndex;
}

// ============================== Params ==============================
export interface StickyHeaderParams<T, K extends React.Key = React.Key> {
  enabled: boolean;
  group: Group<T, K> | undefined;
  headerRows: HeaderRow<K>[];
  groupKeyToItems: Map<K, T[]>;
  prefixCls: string;
}

export default function useStickyGroupHeader<
  T,
  K extends React.Key = React.Key,
>(params: StickyHeaderParams<T, K>) {
  // ============================== Props ==============================
  const {
    enabled,
    group,
    headerRows,
    groupKeyToItems,
    prefixCls,
  } = params;

  // ============================ Extra Render ==========================
  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { getSize, offsetY, scrollTop, start, virtual } = info;

      if (!enabled || !group || !headerRows.length || !virtual) {
        return null;
      }

      // The sticky header is the latest group header before the visible range.
      const activeHeaderIdx = findActiveHeaderIndex(headerRows, start);
      const currHeader = headerRows[activeHeaderIdx];

      const groupItems = groupKeyToItems.get(currHeader.groupKey) || [];
      const currentSize = getSize(currHeader.groupKey);
      const headerHeight = currentSize.bottom - currentSize.top;

      // Convert the virtual list scroll position into the overlay top offset.
      const fixedTop = scrollTop - offsetY;

      // Let the next group header push the current fixed header away.
      const nextHeader = headerRows[activeHeaderIdx + 1];
      const nextTop = nextHeader
        ? getSize(nextHeader.groupKey).top - headerHeight - offsetY
        : fixedTop;
      const top = Math.min(fixedTop, nextTop);

      // Render a cloned header above the virtual list items.
      return (
        <GroupHeader
          fixed
          group={group}
          groupKey={currHeader.groupKey}
          groupItems={groupItems}
          prefixCls={prefixCls}
          style={{ top }}
        />
      );
    },
    [enabled, group, headerRows, groupKeyToItems, prefixCls],
  );

  // ============================== Return ==============================
  return extraRender;
}
