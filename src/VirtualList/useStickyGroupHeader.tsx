import * as React from 'react';
import Portal from '@rc-component/portal';
import type {
  ListProps as VirtualListProps,
  ListRef as RcVirtualListRef,
} from '@rc-component/virtual-list';
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
  listRef: React.RefObject<RcVirtualListRef | null>;
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
    listRef,
  } = params;

  // ============================ Extra Render ==========================
  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { getSize, scrollTop, start, virtual } = info;

      if (!enabled || !group || !headerRows.length || !virtual) {
        return null;
      }

      const container = listRef.current?.nativeElement;
      if (!container) {
        return null;
      }

      // The sticky header is the latest group header before the visible range.
      const activeHeaderIdx = findActiveHeaderIndex(headerRows, start);
      const currHeader = headerRows[activeHeaderIdx];

      const groupItems = groupKeyToItems.get(currHeader.groupKey) || [];
      const currentSize = getSize(currHeader.groupKey);
      const headerHeight = currentSize.bottom - currentSize.top;

      const nextHeader = headerRows[activeHeaderIdx + 1];
      const top = nextHeader
        ? Math.min(0, getSize(nextHeader.groupKey).top - headerHeight - scrollTop)
        : 0;

      // Render a cloned header pinned over the virtual list.
      return (
        <Portal open getContainer={() => container}>
          <GroupHeader
            fixed
            group={group}
            groupKey={currHeader.groupKey}
            groupItems={groupItems}
            prefixCls={prefixCls}
            style={{ top }}
          />
        </Portal>
      );
    },
    [enabled, group, headerRows, groupKeyToItems, prefixCls, listRef],
  );

  // ============================== Return ==============================
  return extraRender;
}
