import * as React from 'react';
import clsx from 'clsx';
import GroupHeader from '../GroupHeader';
import useGroupSegments from '../hooks/useGroupSegments';
import useItemKey from '../hooks/useItemKey';
import useRawListScroll from './useRawListScroll';
import { toTaggedKey, type KeyType } from '../util';
import type { ListComponentProps, ListyRef } from '../List';

// ============================== Types ===============================
export type RawListProps<
  T,
  K extends React.Key = React.Key,
> = ListComponentProps<T, K>;

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
    direction,
    classNames,
    styles,
  } = props;

  // =============================== Refs ===============================
  const holderRef = useRawListScroll(ref, prefixCls, !!(sticky && group));

  // =============================== Data ===============================
  const groupData = useGroupSegments<T, K>(data, group);

  // ============================== Utils ===============================
  const getItemKey = useItemKey(rowKey);

  const getScrollTargetProps = React.useCallback(
    (key: React.Key, type: KeyType) => ({
      'data-key': toTaggedKey(key, type),
    }),
    [],
  );

  // ============================ Render Item ===========================
  const renderItem = React.useCallback(
    (item: T, index: number) => {
      const key = getItemKey(item);
      const scrollTargetProps = getScrollTargetProps(key, 'item');

      return (
        <div
          key={key}
          className={clsx(`${prefixCls}-item`, classNames?.item)}
          style={styles?.item}
          {...scrollTargetProps}
        >
          {itemRender(item, index)}
        </div>
      );
    },
    [
      classNames?.item,
      getItemKey,
      getScrollTargetProps,
      itemRender,
      prefixCls,
      styles?.item,
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
            {...getScrollTargetProps(groupKey, 'group')}
          >
            <GroupHeader
              group={group}
              groupKey={groupKey}
              groupItems={currentGroupItems}
              prefixCls={prefixCls}
              sticky={sticky}
              className={classNames?.groupHeader}
              style={styles?.groupHeader}
            />
            {groupItems.map(({ item, index }) => {
              return renderItem(item, index);
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
      className={clsx(
        prefixCls,
        { [`${prefixCls}-rtl`]: direction === 'rtl' },
        classNames?.root,
      )}
      dir={direction}
      style={{
        maxHeight: height,
        overflowY: height === undefined ? undefined : 'auto',
        overflowAnchor: 'none',
        ...styles?.root,
      }}
      onScroll={onScroll}
    >
      {rawContent}
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
