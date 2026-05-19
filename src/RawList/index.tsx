import * as React from 'react';
import GroupHeader from '../GroupHeader';
import type { Row } from '../hooks/useFlattenRows';
import type { GroupSegmentItem, Group } from '../hooks/useGroupSegments';
import useRawListScroll from './useRawListScroll';
import type { ListyRef } from '../List';

export interface RawListProps<T, K extends React.Key = React.Key> {
  data: T[];
  group: Group<T, K> | undefined;
  groupData: Map<K, GroupSegmentItem<T>[]>;
  groupKeyToItems: Map<K, T[]>;
  getKey: (row: Row<T, K>) => React.Key;
  height?: number;
  itemRender: (item: T, index: number) => React.ReactNode;
  onScroll?: React.UIEventHandler<HTMLElement>;
  prefixCls: string;
  sticky?: boolean;
}

function RawList<T, K extends React.Key = React.Key>(
  props: RawListProps<T, K>,
  ref: React.Ref<ListyRef>,
) {
  const {
    data,
    group,
    groupData,
    groupKeyToItems,
    getKey,
    height,
    itemRender,
    onScroll,
    prefixCls,
    sticky,
  } = props;

  const holderRef = useRawListScroll(ref);

  const getScrollTargetProps = React.useCallback(
    (key: React.Key) => ({
      'data-key': String(key),
    }),
    [],
  );

  const renderItem = React.useCallback(
    (item: T, index: number) => {
      const row = { type: 'item', item, index } as Row<T, K>;
      const key = getKey(row);
      const node = itemRender(item, index);
      const scrollTargetProps = getScrollTargetProps(key);

      if (React.isValidElement(node)) {
        return React.cloneElement(node as React.ReactElement<any>, {
          key,
          ...scrollTargetProps,
        });
      }

      return (
        <div key={key} {...scrollTargetProps}>
          {node}
        </div>
      );
    },
    [getKey, getScrollTargetProps, itemRender],
  );

  const rawContent = group
    ? Array.from(groupData).map(([groupKey, groupItems]) => {
        const headerRow = { type: 'header', groupKey } as Row<T, K>;
        const key = getKey(headerRow);
        const currentGroupItems = groupKeyToItems.get(groupKey) || [];

        return (
          <section
            key={key}
            className={`${prefixCls}-group-section`}
            {...getScrollTargetProps(key)}
          >
            <GroupHeader
              group={group}
              groupKey={groupKey}
              groupItems={currentGroupItems}
              prefixCls={prefixCls}
              sticky={sticky}
            />
            {groupItems.map(({ item, index }) => {
              return renderItem(item, index);
            })}
          </section>
        );
      })
    : data.map((item, index) => {
        return renderItem(item, index);
      });

  return (
    <div
      ref={holderRef}
      className={`${prefixCls}-holder`}
      style={{
        maxHeight: height,
        overflowY: height === undefined ? undefined : 'auto',
        overflowAnchor: 'none',
      }}
      onScroll={onScroll}
    >
      <div className={`${prefixCls}-holder-inner`}>{rawContent}</div>
    </div>
  );
}

const RawListWithRef = React.forwardRef(RawList) as <
  T,
  K extends React.Key = React.Key,
>(
  props: RawListProps<T, K> & { ref?: React.Ref<ListyRef> },
) => React.ReactElement;

export default RawListWithRef;
