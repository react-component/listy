import * as React from 'react';
import Portal from '@rc-component/portal';
import type {
  ListProps as VirtualListProps,
  ListRef as RcVirtualListRef,
} from '@rc-component/virtual-list';
import type { Group } from '../hooks/useGroupSegments';
import GroupHeader from '../GroupHeader';
import { toTaggedKey } from '../util';

// ============================== Types ===============================
type ExtraRenderInfo = Parameters<
  NonNullable<VirtualListProps<unknown>['extraRender']>
>[0];

// ============================== Utils ===============================
const HEADER_TOP_TOLERANCE = 1;

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

    if (getHeaderTop(groupKeys[mid]) <= scrollTop + HEADER_TOP_TOLERANCE) {
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
  scrollWidth?: number;
  headerClassName?: string;
  headerStyle?: React.CSSProperties;
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
    scrollWidth,
    headerClassName,
    headerStyle,
  } = params;

  // ============================ Extra Render ==========================
  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { getSize, scrollTop, virtual, offsetX, rtl } = info;

      if (!enabled || !group || !groupKeys.length || !virtual) {
        return null;
      }

      const container = listRef.current?.nativeElement;
      if (!container) {
        return null;
      }

      const getGroupSize = (groupKey: K) =>
        getSize(toTaggedKey(groupKey, 'group'));

      // The sticky header is the group whose section the viewport top sits in.
      const activeHeaderIdx = findActiveHeaderIndex(
        groupKeys,
        (groupKey) => getGroupSize(groupKey).top,
        scrollTop,
      );
      const currGroupKey = groupKeys[activeHeaderIdx];

      const groupItems = groupKeyToItems.get(currGroupKey) || [];
      const currentSize = getGroupSize(currGroupKey);
      const headerHeight = currentSize.bottom - currentSize.top;

      const nextGroupKey = groupKeys[activeHeaderIdx + 1];
      // Explicit undefined check: a falsy group key (0, '') is still a group.
      const top =
        nextGroupKey !== undefined
          ? Math.min(
              0,
              getGroupSize(nextGroupKey).top - headerHeight - scrollTop,
            )
          : 0;

      const horizontalStyle: React.CSSProperties | undefined = scrollWidth
        ? {
            width: scrollWidth,
            left: rtl ? 'auto' : 0,
            right: rtl ? 0 : 'auto',
            transform: `translateX(${rtl ? offsetX : -offsetX}px)`,
          }
        : undefined;

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
              className={headerClassName}
              // `top` is the computed sticky-push offset and must win over any
              // user-supplied top in headerStyle, or the sticky behavior breaks.
              style={{ ...headerStyle, ...horizontalStyle, top }}
            />
          </div>
        </Portal>
      );
    },
    [
      enabled,
      group,
      groupKeys,
      groupKeyToItems,
      prefixCls,
      listRef,
      scrollWidth,
      headerClassName,
      headerStyle,
    ],
  );

  // ============================== Return ==============================
  return extraRender;
}
