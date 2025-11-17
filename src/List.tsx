import * as React from 'react';
import VirtualList, { type ListRef } from 'rc-virtual-list';
import type {
  GetKey,
  ListyProps,
  ListyRef,
} from './interface';
import { useImperativeHandle, forwardRef } from 'react';
import useGroupSegments from './hooks/useGroupSegments';
import useFlattenRows from './hooks/useFlattenRows';
import type { Row } from './hooks/useFlattenRows';
import useStickyGroupHeader from './hooks/useStickyGroupHeader';
import useOnEndReached from './hooks/useOnEndReached';
import { isGroupScrollConfig } from './util';
import clsx from 'clsx';

function Listy<T, K extends React.Key = React.Key>(
  props: ListyProps<T, K>,
  ref: React.Ref<ListyRef>,
) {
  const {
    items,
    itemRender,
    group,
    onEndReached,
    rowKey,
    height,
    itemHeight,
    sticky,
    virtual = true,
    prefixCls = 'rc-listy',
  } = props;

  const data = items || [];

  const listRef = React.useRef<ListRef>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const getItemKey = React.useCallback<GetKey<T>>(
    (item: T) => {
      if (typeof rowKey === 'function') {
        return rowKey(item);
      }
      return item?.[rowKey as string];
    },
    [rowKey],
  );

  const groupSegments = useGroupSegments<T, K>(data, group);

  // ======================= Flatten rows (header + item) =======================
  const { rows, headerRows, groupKeyToSeg } = useFlattenRows<T, K>(
    data,
    group,
    groupSegments,
  );

  const getKey = React.useCallback(
    (row: Row<T, K>): React.Key => {
      if (row.type === 'header') {
        return row.groupKey;
      }
      return getItemKey(row.item);
    },
    [getItemKey],
  );

  // Pre-compute each group's items to simplify header rendering
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

  // Sticky header overlay via Portal (anchored on header rows)
  const extraRender = useStickyGroupHeader<T, K>({
    enabled: !!(sticky && group),
    group,
    headerRows,
    groupKeyToItems,
    containerRef,
    listRef,
    prefixCls,
  });

  const renderHeaderRow = React.useCallback(
    (groupKey: K) => {
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
    [group, groupKeyToItems, prefixCls, virtual],
  );

  const handleOnScroll = useOnEndReached({
    enabled: !!onEndReached,
    onEndReached,
  });

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
        onScroll={handleOnScroll}
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

const ListyWithForwardRef = forwardRef(Listy) as <
  T,
  K extends React.Key = React.Key,
>(
  props: ListyProps<T, K> & { ref?: React.Ref<ListyRef> },
) => React.ReactElement;

export default ListyWithForwardRef;
