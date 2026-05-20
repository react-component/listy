import * as React from 'react';
import RcVirtualList, {
  type ListRef as RcVirtualListRef,
  type ScrollConfig,
} from '@rc-component/virtual-list';
import { useEvent } from '@rc-component/util';
import GroupHeader from '../GroupHeader';
import type { ListComponentProps, ListyRef } from '../interface';
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

  React.useImperativeHandle(
    ref,
    () => ({
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

        listRef.current?.scrollTo(config as number | ScrollConfig | null);
      },
    }),
    [],
  );

  const groupData = useGroupSegments<T, K>(data, group);

  const getKey = useEvent((row: Row<T, K>): React.Key => {
    if (row.type === 'header') {
      return row.groupKey;
    }

    if (typeof rowKey === 'function') {
      return rowKey(row.item);
    }
    return row.item[rowKey] as React.Key;
  });

  const { rows, headerRows, groupKeyToItems } = useFlattenRows<T, K>(
    data,
    groupData,
    group,
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

const VirtualListWithRef = React.forwardRef(VirtualList) as <
  T,
  K extends React.Key = React.Key,
>(
  props: VirtualListProps<T, K> & { ref?: React.Ref<ListyRef> },
) => React.ReactElement;

export default VirtualListWithRef;
