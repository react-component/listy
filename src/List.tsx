import * as React from 'react';
import VirtualList, { type ListRef } from 'rc-virtual-list';
import type { ListyProps, ListyRef } from './interface';
import { useImperativeHandle, forwardRef } from 'react';
import useGroupSegments from './hooks/useGroupSegments';
import useFlattenRows from './hooks/useFlattenRows';
import type { Row } from './hooks/useFlattenRows';
import useStickyGroupHeader from './hooks/useStickyGroupHeader';
import { isGroupScrollConfig } from './util';
import clsx from 'clsx';
import { useEvent } from '@rc-component/util';

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
      if (isGroupScrollConfig(config)) {
        const { groupKey, align, offset } = config;
        listRef.current?.scrollTo({
          key: groupKey,
          align,
          offset,
        });
        return;
      }
      listRef.current?.scrollTo(config);
    },
  }));

  // ============================= Grouping =============================
  const groupSegments = useGroupSegments<T, K>(data, group);

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
  const { rows, headerRows, groupKeyToSeg } = useFlattenRows<T, K>(
    data,
    group,
    groupSegments,
  );

  // ============================ Group Items ============================
  const groupKeyToItems = React.useMemo(() => {
    const map = new Map<K, T[]>();
    if (!group) {
      return map;
    }
    groupKeyToSeg.forEach(({ startIndex, endIndex }, key) => {
      map.set(key, data.slice(startIndex, endIndex + 1));
    });
    return map;
  }, [group, groupKeyToSeg, data]);

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
