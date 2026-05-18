import * as React from 'react';
import type { ListRef } from 'rc-virtual-list';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';
import type { Group } from './useGroupSegments';
import GroupHeader from '../GroupHeader';

export interface StickyHeaderParams<T, K extends React.Key = React.Key> {
  enabled: boolean;
  group: Group<T, K> | undefined;
  headerRows: { groupKey: K; rowIndex: number }[];
  groupKeyToItems: Map<K, T[]>;
  listRef: React.RefObject<ListRef | null>;
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
    listRef,
    prefixCls,
  } = params;

  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { offsetY, start, virtual } = info;

      if (!enabled || !group || !headerRows.length || !virtual) {
        return null;
      }

      let currHeader = headerRows[0];
      for (let i = headerRows.length - 1; i >= 0; i -= 1) {
        if (headerRows[i].rowIndex <= start) {
          currHeader = headerRows[i];
          break;
        }
      }

      const groupItems = groupKeyToItems.get(currHeader.groupKey) || [];
      const holder = listRef.current?.nativeElement?.querySelector<HTMLElement>(
        `.${prefixCls}-holder`,
      );
      // `extraRender` runs before the imperative ListRef is refreshed for this
      // render, but rc-virtual-list syncs the holder scrollTop first.
      const scrollTop =
        holder?.scrollTop ?? listRef.current?.getScrollInfo?.().y ?? offsetY;
      const top = scrollTop - offsetY;

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
    [enabled, group, headerRows, groupKeyToItems, listRef, prefixCls],
  );

  return extraRender;
}
