import * as React from 'react';
import RcVirtualList, {
  type ListRef as RcVirtualListRef,
  type ScrollConfig,
  type ScrollOffsetInfo,
} from '@rc-component/virtual-list';
import { useEvent } from '@rc-component/util';
import GroupHeader from '../GroupHeader';
import type { ListComponentProps, ListyRef } from '../List';
import useFlattenRows from '../hooks/useFlattenRows';
import type { Row } from '../hooks/useFlattenRows';
import useGroupSegments from '../hooks/useGroupSegments';
import useStickyGroupHeader from './useStickyGroupHeader';

export type VirtualListProps<
  T,
  K extends React.Key = React.Key,
> = ListComponentProps<T, K>;

function VirtualList<T, K extends React.Key = React.Key>(
  props: VirtualListProps<T, K>,
  ref: React.Ref<ListyRef>,
) {
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
  } = props;

  const listRef = React.useRef<RcVirtualListRef>(null);

  const groupData = useGroupSegments<T, K>(data, group);

  const getItemKey = useEvent((item: T): React.Key => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    return item[rowKey] as React.Key;
  });

  const getKey = useEvent((row: Row<T, K>): React.Key => {
    if (row.type === 'header') {
      return row.groupKey;
    }

    return getItemKey(row.item);
  });

  const { rows, headerRows, groupKeyToItems } = useFlattenRows<T, K>(
    data,
    groupData,
    group,
  );

  const itemKeyToGroupKey = React.useMemo(() => {
    const itemGroupMap = new Map<React.Key, K>();

    groupData.forEach((groupItems, groupKey) => {
      groupItems.forEach(({ item }) => {
        itemGroupMap.set(getItemKey(item), groupKey);
      });
    });

    return itemGroupMap;
  }, [getItemKey, groupData]);

  const scrollTo = useEvent<ListyRef['scrollTo']>((config) => {
    if (config && typeof config === 'object' && 'groupKey' in config) {
      const { groupKey, align, offset } = config;
      listRef.current?.scrollTo({
        key: groupKey,
        align,
        offset,
      });
      return;
    }

    if (
      config &&
      typeof config === 'object' &&
      'key' in config &&
      sticky &&
      group &&
      config.align === 'top'
    ) {
      const groupKey = itemKeyToGroupKey.get(config.key);

      if (groupKey !== undefined) {
        const { offset = 0 } = config;

        listRef.current?.scrollTo({
          ...config,
          // Use the measured header height so top-aligned items stay below it.
          offset: ({ getSize }: ScrollOffsetInfo) => {
            const headerSize = getSize(groupKey);
            const headerHeight = headerSize.bottom - headerSize.top;

            return offset + (Number.isFinite(headerHeight) ? headerHeight : 0);
          },
        });
        return;
      }
    }

    listRef.current?.scrollTo(config as number | ScrollConfig | null);
  });

  React.useImperativeHandle(
    ref,
    () => ({
      scrollTo,
    }),
    [scrollTo],
  );

  const extraRender = useStickyGroupHeader<T, K>({
    enabled: !!(sticky && group),
    group,
    headerRows,
    groupKeyToItems,
    prefixCls,
  });

  const renderHeaderRow = React.useCallback(
    (groupKey: K) => {
      const groupItems = groupKeyToItems.get(groupKey) || [];

      return (
        <GroupHeader
          group={group!}
          groupKey={groupKey}
          groupItems={groupItems}
          prefixCls={prefixCls}
        />
      );
    },
    [group, groupKeyToItems, prefixCls],
  );

  return (
    <RcVirtualList
      ref={listRef}
      data={rows}
      fullHeight={false}
      height={height}
      itemHeight={itemHeight}
      itemKey={getKey}
      onScroll={onScroll}
      prefixCls={prefixCls}
      virtual
      extraRender={extraRender}
    >
      {(row: Row<T, K>) =>
        row.type === 'header'
          ? renderHeaderRow(row.groupKey)
          : itemRender(row.item, row.index)
      }
    </RcVirtualList>
  );
}

const VirtualListWithRef = React.forwardRef(VirtualList as any) as any;

export default VirtualListWithRef;
