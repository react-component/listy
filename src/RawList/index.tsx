import * as React from 'react';
import ResizeObserver from '@rc-component/resize-observer';
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
  const holderRef = useRawListScroll(ref);

  // =============================== Data ===============================
  const groupData = useGroupSegments<T, K>(data, group);
  const [headerHeights, setHeaderHeights] = React.useState<
    Map<K, number>
  >(() => new Map());

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

  const setGroupHeaderHeight = React.useCallback(
    (groupKey: K, headerHeight: number) => {
      setHeaderHeights((prev) => {
        const next = new Map(prev);
        next.set(groupKey, headerHeight);
        return next;
      });
    },
    [],
  );

  // ============================ Render Item ===========================
  const renderItem = React.useCallback(
    (item: T, index: number, groupKey?: K) => {
      const key = getItemKey(item);
      const scrollTargetProps = getScrollTargetProps(key);
      const headerHeight =
        sticky && groupKey !== undefined ? headerHeights.get(groupKey) : 0;

      return (
        <div
          key={key}
          className={`${prefixCls}-item`}
          style={
            headerHeight
              ? {
                  scrollMarginTop: headerHeight,
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
      headerHeights,
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
            <ResizeObserver
              disabled={!sticky}
              onResize={({ offsetHeight }) => {
                setGroupHeaderHeight(groupKey, offsetHeight);
              }}
            >
              <GroupHeader
                group={group}
                groupKey={groupKey}
                groupItems={currentGroupItems}
                prefixCls={prefixCls}
                sticky={sticky}
              />
            </ResizeObserver>
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

const RawListWithRef = React.forwardRef(RawList as any) as any;

export default RawListWithRef;
