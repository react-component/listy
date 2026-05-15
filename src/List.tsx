import * as React from 'react';
import VirtualList, { type ListRef } from 'rc-virtual-list';
import type { ScrollTo } from 'rc-virtual-list/lib/List';
import { useImperativeHandle, forwardRef } from 'react';
import useGroupSegments from './hooks/useGroupSegments';
import type { Group } from './hooks/useGroupSegments';
import useFlattenRows from './hooks/useFlattenRows';
import type { Row } from './hooks/useFlattenRows';
import useStickyGroupHeader from './hooks/useStickyGroupHeader';
import clsx from 'clsx';
import { useEvent } from '@rc-component/util';

type RowKey<T> = keyof T | ((item: T) => React.Key);

export type ScrollAlign = 'top' | 'bottom' | 'auto';

export interface GroupScrollToConfig {
  groupKey: string;
  align?: ScrollAlign;
  offset?: number;
}

export type ListyScrollToConfig =
  | Parameters<ScrollTo>[0]
  | GroupScrollToConfig;

export interface ListyRef {
  scrollTo: (config?: ListyScrollToConfig) => void;
}

export interface ListyProps<T, K extends React.Key = React.Key> {
  items?: T[];
  sticky?: boolean;
  itemHeight?: number;
  height?: number;
  group?: Group<T, K>;
  virtual?: boolean;
  prefixCls?: string;
  rowKey: RowKey<T>;
  onScroll?: React.UIEventHandler<HTMLElement>;
  itemRender: (item: T, index: number) => React.ReactNode;
}

function Listy<T, K extends React.Key = React.Key>(
  props: ListyProps<T, K>,
  ref: React.Ref<ListyRef>,
) {
  // ============================== Props ==============================
  const {
    items,
    itemRender,
    group,
    onScroll,
    rowKey,
    height,
    itemHeight,
    sticky,
    virtual = true,
    prefixCls = 'rc-listy',
  } = props;

  // =============================== Data ===============================
  const data = React.useMemo(() => items || [], [items]);

  // =============================== Refs ===============================
  const listRef = React.useRef<ListRef>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // ========================== Imperative API ==========================
  useImperativeHandle(ref, () => ({
    scrollTo: (config) => {
      if (config && typeof config === 'object' && 'groupKey' in config) {
        const { groupKey, align, offset } = config;
        listRef.current?.scrollTo({
          key: groupKey,
          align,
          offset,
        });
        return;
      }
      listRef.current?.scrollTo(config as Parameters<ScrollTo>[0]);
    },
  }));

  // ============================= Grouping =============================
  const groupData = useGroupSegments<T, K>(data, group);

  // ============================= Row Keys =============================
  const getKey = useEvent((row: Row<T, K>): React.Key => {
    if (row.type === 'header') {
      return row.groupKey;
    }

    if (typeof rowKey === 'function') {
      return rowKey(row.item);
    }
    return row.item[rowKey] as React.Key;
  });

  // ============================= Flat Rows =============================
  const { rows, headerRows, groupKeyToItems } = useFlattenRows<T, K>(
    data,
    groupData,
    group,
  );

  // =========================== Sticky Header ===========================
  const extraRender = useStickyGroupHeader<T, K>({
    enabled: !!(sticky && group),
    group,
    headerRows,
    groupKeyToItems,
    containerRef,
    listRef,
    prefixCls,
  });

  // ============================= Row Render ============================
  const renderHeaderRow = React.useCallback(
    (groupKey: K) => {
      if (!group) {
        return null;
      }

      const groupItems = groupKeyToItems.get(groupKey) || [];
      const headerClassName = clsx(`${prefixCls}-group-header`, {
        [`${prefixCls}-group-header-sticky`]: sticky && !virtual,
      });

      return (
        <div className={headerClassName}>
          {group.title(groupKey, groupItems)}
        </div>
      );
    },
    [group, groupKeyToItems, prefixCls, sticky, virtual],
  );

  // ============================== Render ===============================
  return (
    <div ref={containerRef} className={prefixCls}>
      <VirtualList
        virtual={virtual}
        ref={listRef}
        data={rows}
        fullHeight={false}
        itemHeight={itemHeight}
        itemKey={getKey}
        height={height}
        extraRender={extraRender}
        onScroll={onScroll}
        prefixCls={prefixCls}
      >
        {(row: Row<T, K>) =>
          row.type === 'header'
            ? renderHeaderRow(row.groupKey)
            : itemRender(row.item, row.index)
        }
      </VirtualList>
    </div>
  );
}

// Const to support generic with forwardRef
const ListyWithForwardRef = forwardRef(Listy) as <
  T,
  K extends React.Key = React.Key,
>(
  props: ListyProps<T, K> & { ref?: React.Ref<ListyRef> },
) => React.ReactElement;

export default ListyWithForwardRef;
