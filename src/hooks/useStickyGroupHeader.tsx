import * as React from 'react';
import type { ListProps as VirtualListProps } from '@rc-component/virtual-list';
import type { Group } from './useGroupSegments';
import GroupHeader from '../GroupHeader';

type ExtraRenderInfo = Parameters<
  NonNullable<VirtualListProps<unknown>['extraRender']>
>[0];

export interface StickyHeaderParams<T, K extends React.Key = React.Key> {
  enabled: boolean;
  group: Group<T, K> | undefined;
  headerRows: { groupKey: K; rowIndex: number }[];
  groupKeyToItems: Map<K, T[]>;
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
    prefixCls,
  } = params;

  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { getSize, offsetY, scrollTop, start, virtual } = info;

      if (!enabled || !group || !headerRows.length || !virtual) {
        return null;
      }

      let activeHeaderIdx = 0;
      let currHeader = headerRows[0];
      for (let i = headerRows.length - 1; i >= 0; i -= 1) {
        if (headerRows[i].rowIndex <= start) {
          activeHeaderIdx = i;
          currHeader = headerRows[i];
          break;
        }
      }

      const groupItems = groupKeyToItems.get(currHeader.groupKey) || [];
      const currentSize = getSize(currHeader.groupKey);
      const headerHeight = currentSize.bottom - currentSize.top;
      const fixedTop = scrollTop - offsetY;

      const nextHeader = headerRows[activeHeaderIdx + 1];
      const nextTop = nextHeader
        ? getSize(nextHeader.groupKey).top - headerHeight - offsetY
        : fixedTop;
      const top = Math.min(fixedTop, nextTop);

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

  return extraRender;
}
