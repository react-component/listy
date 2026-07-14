import * as React from 'react';
import clsx from 'clsx';
import RcVirtualList, {
  type ListRef as RcVirtualListRef,
  type ScrollConfig,
  type ScrollOffsetInfo,
} from '@rc-component/virtual-list';
import { useEvent } from '@rc-component/util';
import GroupHeader from '../GroupHeader';
import type { ListComponentProps, ListyRef } from '../List';
import { toTaggedKey } from '../util';
import useGroupSegments from '../hooks/useGroupSegments';
import useItemKey from '../hooks/useItemKey';
import useFlattenRows from './useFlattenRows';
import type { Row } from './useFlattenRows';
import useStickyGroupHeader from './useStickyGroupHeader';

// ============================== Types ===============================
export type VirtualListProps<
  T,
  K extends React.Key = React.Key,
> = ListComponentProps<T, K>;

function VirtualList<T, K extends React.Key = React.Key>(
  props: VirtualListProps<T, K>,
  ref: React.Ref<ListyRef>,
) {
  // ============================== Props ==============================
  const {
    data,
    group,
    height,
    itemHeight,
    itemRender,
    onScroll,
    prefixCls,
    rowKey,
    sticky,
    direction,
    classNames,
    styles,
  } = props;

  // =============================== Refs ===============================
  const listRef = React.useRef<RcVirtualListRef>(null);

  // =============================== Data ===============================
  const groupData = useGroupSegments<T, K>(data, group);

  // =============================== Keys ===============================
  const getItemKey = useItemKey(rowKey);

  // ============================== Rows ================================
  const { rows, groupKeys, groupKeyToItems } = useFlattenRows<T, K>(
    data,
    groupData,
    getItemKey,
    group,
  );

  // ============================== Lookup ==============================
  const itemKeyToGroupKey = React.useMemo(() => {
    const itemGroupMap = new Map<string, K>();
    let currentGroupKey: K | undefined;

    rows.forEach((row) => {
      if (row.type === 'group') {
        currentGroupKey = row.groupKey;
      } else if (currentGroupKey !== undefined) {
        itemGroupMap.set(row.taggedKey, currentGroupKey);
      }
    });

    return itemGroupMap;
  }, [rows]);

  // ============================== Scroll ==============================
  const scrollTo = useEvent<ListyRef['scrollTo']>((config) => {
    if (!config || typeof config !== 'object') {
      listRef.current?.scrollTo(config as number | ScrollConfig | null);
      return;
    }

    if ('groupKey' in config) {
      const { groupKey, align, offset } = config;
      listRef.current?.scrollTo({
        key: toTaggedKey(groupKey, 'group'),
        align,
        offset,
      });
      return;
    }

    if ('key' in config) {
      const taggedItemKey = toTaggedKey(config.key, 'item');
      const stickyGroupKey =
        sticky && group && config.align !== 'bottom'
          ? itemKeyToGroupKey.get(taggedItemKey)
          : undefined;

      if (stickyGroupKey === undefined) {
        listRef.current?.scrollTo({ ...config, key: taggedItemKey });
        return;
      }

      listRef.current?.scrollTo({
        ...config,
        key: taggedItemKey,
        offset: ({ getSize, align }: ScrollOffsetInfo) => {
          const baseOffset = config.offset ?? 0;

          if (align !== 'top') {
            return baseOffset;
          }

          // Use the measured header height so the item stays below it.
          const headerSize = getSize(toTaggedKey(stickyGroupKey, 'group'));
          const headerHeight = headerSize.bottom - headerSize.top;

          return baseOffset + (Number.isFinite(headerHeight) ? headerHeight : 0);
        },
      });
      return;
    }

    listRef.current?.scrollTo(config);
  });

  // ============================ Imperative ============================
  React.useImperativeHandle(
    ref,
    () => ({
      scrollTo,
    }),
    [scrollTo],
  );

  // ============================== Sticky ==============================
  const extraRender = useStickyGroupHeader<T, K>({
    enabled: !!(sticky && group),
    group,
    groupKeys,
    groupKeyToItems,
    prefixCls,
    listRef,
    headerClassName: classNames?.groupHeader,
    headerStyle: styles?.groupHeader,
  });

  // ============================ Render Row ============================
  const renderHeaderRow = React.useCallback(
    (groupKey: K) => {
      const groupItems = groupKeyToItems.get(groupKey) || [];

      return (
        <GroupHeader
          group={group!}
          groupKey={groupKey}
          groupItems={groupItems}
          prefixCls={prefixCls}
          className={classNames?.groupHeader}
          style={styles?.groupHeader}
        />
      );
    },
    [classNames?.groupHeader, group, groupKeyToItems, prefixCls, styles?.groupHeader],
  );

  // ============================== Render ==============================
  return (
    <RcVirtualList
      ref={listRef}
      data={rows}
      direction={direction}
      fullHeight={false}
      height={height}
      itemHeight={itemHeight}
      itemKey="taggedKey"
      onScroll={onScroll}
      prefixCls={prefixCls}
      virtual
      extraRender={extraRender}
      className={classNames?.root}
      style={styles?.root}
    >
      {(row: Row<T, K>) =>
        row.type === 'group'
          ? renderHeaderRow(row.groupKey)
          : (
              <div
                className={clsx(`${prefixCls}-item`, classNames?.item)}
                style={styles?.item}
              >
                {itemRender(row.item, row.index)}
              </div>
            )
      }
    </RcVirtualList>
  );
}

const VirtualListWithRef = React.forwardRef(VirtualList) as <
  T,
  K extends React.Key = React.Key,
>(
  props: VirtualListProps<T, K> & { ref?: React.Ref<ListyRef> },
) => React.ReactElement;

export default VirtualListWithRef;
