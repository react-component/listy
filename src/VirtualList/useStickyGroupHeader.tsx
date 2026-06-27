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

// ============================== Utils ===============================
function findActiveHeaderIndex<K extends React.Key>(
  groupKeys: K[],
  getHeaderTop: (groupKey: K) => number,
  scrollTop: number,
) {
  let left = 0;
  let right = groupKeys.length - 1;
  let activeIndex = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (getHeaderTop(groupKeys[mid]) <= scrollTop) {
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
  groupKeys: K[];
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
    groupKeys,
    groupKeyToItems,
    prefixCls,
    listRef,
  } = params;

  // ============================ Extra Render ==========================
  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { getSize, scrollTop, virtual } = info;

      if (!enabled || !group || !groupKeys.length || !virtual) {
        return null;
      }

      const container = listRef.current?.nativeElement;
      if (!container) {
        return null;
      }

      // The sticky header is the group whose section the viewport top sits in.
      const activeHeaderIdx = findActiveHeaderIndex(
        groupKeys,
        (groupKey) => getSize(groupKey).top,
        scrollTop,
      );
      const currGroupKey = groupKeys[activeHeaderIdx];

      const groupItems = groupKeyToItems.get(currGroupKey) || [];
      const currentSize = getSize(currGroupKey);
      const headerHeight = currentSize.bottom - currentSize.top;

      const nextGroupKey = groupKeys[activeHeaderIdx + 1];
      const top = nextGroupKey
        ? Math.min(0, getSize(nextGroupKey).top - headerHeight - scrollTop)
        : 0;

      // Render a cloned header pinned over the virtual list.
      return (
        <Portal open getContainer={() => container}>
          <div className={`${prefixCls}-group-header-holder`}>
            <GroupHeader
              fixed
              group={group}
              groupKey={currGroupKey}
              groupItems={groupItems}
              prefixCls={prefixCls}
              style={{ top }}
            />
          </div>
        </Portal>
      );
    },
    [enabled, group, groupKeys, groupKeyToItems, prefixCls, listRef],
  );

  // ============================== Return ==============================
  return extraRender;
}
