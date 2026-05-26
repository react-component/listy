import * as React from 'react';
import { useEvent } from '@rc-component/util';
import GroupHeader from '../GroupHeader';
import useGroupSegments from '../hooks/useGroupSegments';
import useRawListScroll from './useRawListScroll';
import type { ListComponentProps, ListyRef } from '../List';

// ============================== Types ===============================
export type RawListProps<T, K extends React.Key = React.Key> =
  ListComponentProps<T, K>;

function RawList<T, K extends React.Key = React.Key>(
  props: RawListProps<T, K>,
  ref: React.Ref<ListyRef>,
) {
  // ============================== Props ==============================
  const {
    data,
    group,
    height,
    itemRender,
    onScroll,
    prefixCls,
    rowKey,
    sticky,
  } = props;

  // =============================== Refs ===============================
  const holderRef = useRawListScroll(ref, prefixCls, !!(sticky && group));

  // =============================== Data ===============================
  const groupData = useGroupSegments<T, K>(data, group);

  // ============================== Utils ===============================
  const getItemKey = useEvent((item: T): React.Key => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    return item[rowKey] as React.Key;
  });

  const getScrollTargetProps = React.useCallback(
    (key: React.Key) => ({
      'data-key': String(key),
    }),
    [],
  );

  // ============================ Render Item ===========================
  const renderItem = React.useCallback(
    (item: T, index: number, groupKey?: K) => {
      const key = getItemKey(item);
      const scrollTargetProps = getScrollTargetProps(key);

      return (
        <div
          key={key}
          className={`${prefixCls}-item`}
          style={
            sticky && groupKey !== undefined
              ? {
                  scrollMarginTop: `var(--${prefixCls}-item-scroll-margin-top, 0px)`,
                }
              : undefined
          }
          {...scrollTargetProps}
        >
          {itemRender(item, index)}
        </div>
      );
    },
    [
      getItemKey,
      getScrollTargetProps,
      itemRender,
      prefixCls,
      sticky,
    ],
  );

  // ============================= Content ==============================
  const rawContent = group
    ? Array.from(groupData, ([groupKey, groupItems]) => {
        const currentGroupItems = groupItems.map(({ item }) => item);

        return (
          <div
            key={groupKey}
            className={`${prefixCls}-group-section`}
            {...getScrollTargetProps(groupKey)}
          >
            <GroupHeader
              group={group}
              groupKey={groupKey}
              groupItems={currentGroupItems}
              prefixCls={prefixCls}
              sticky={sticky}
            />
            {groupItems.map(({ item, index }) => {
              return renderItem(item, index, groupKey);
            })}
          </div>
        );
      })
    : data.map((item, index) => {
        return renderItem(item, index);
      });

  // ============================== Render ==============================
  return (
    <div
      ref={holderRef}
      className={prefixCls}
      style={{
        maxHeight: height,
        overflowY: height === undefined ? undefined : 'auto',
        overflowAnchor: 'none',
      }}
      onScroll={onScroll}
    >
      {rawContent}
    </div>
  );
}

const RawListWithRef = React.forwardRef(RawList as any) as any;

export default RawListWithRef;
