import * as React from 'react';
import VirtualList, { type ListRef } from 'rc-virtual-list';
import type { ListyProps, ListyRef } from './interface';
import { useImperativeHandle, forwardRef } from 'react';
import Portal from '@rc-component/portal';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';

function Listy<T>(props: ListyProps<T>, ref: React.Ref<ListyRef>) {
  const {
    items,
    itemRender,
    group,
    onStartReached,
    onEndReached,
    rowKey,
    height,
    itemHeight,
    sticky,
  } = props;

  const data = items || [];

  const listRef = React.useRef<ListRef>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollTo: (config: any) => {
      listRef.current?.scrollTo(config);
    },
  }));

  const getItemKey = React.useCallback(
    (item: T): React.Key => {
      if (!rowKey) return undefined as unknown as React.Key;
      if (typeof rowKey === 'function') return rowKey(item);
      return (item as any)[rowKey as any];
    },
    [rowKey],
  );

  const groupSegments = React.useMemo(() => {
    if (!group)
      return [] as Array<{
        key: React.Key;
        startIndex: number;
        endIndex: number;
      }>;

    const segments: Array<{
      key: React.Key;
      startIndex: number;
      endIndex: number;
    }> = [];
    let currentKey: React.Key = null;
    let currentStart = -1;

    const getGroupKey = (item: T): React.Key => {
      return typeof group.key === 'function'
        ? (group.key as (i: T) => React.Key)(item)
        : group.key;
    };

    for (let i = 0; i < data.length; i += 1) {
      const gk = getGroupKey(data[i]);
      if (currentKey === null) {
        currentKey = gk;
        currentStart = i;
      } else if (gk !== currentKey) {
        segments.push({
          key: currentKey,
          startIndex: currentStart,
          endIndex: i - 1,
        });
        currentKey = gk;
        currentStart = i;
      }
    }

    if (currentKey !== null) {
      segments.push({
        key: currentKey,
        startIndex: currentStart,
        endIndex: data.length - 1,
      });
    }

    return segments;
  }, [data, group]);

  const findCurrentGroupIndex = React.useCallback(
    (startIndex: number) => {
      if (!groupSegments.length) return -1;
      let lo = 0;
      let hi = groupSegments.length - 1;
      let ans = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const seg = groupSegments[mid];
        if (seg.startIndex <= startIndex) {
          ans = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      return ans;
    },
    [groupSegments],
  );

  // Sticky header overlay via Portal
  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      if (!sticky || !group || !rowKey || !containerRef.current) return null;
      const { start, offsetY, getSize, virtual, end } = info;
      console.log('start', start);
      console.log('end', end);
      console.log('offsetY', offsetY);

      if (!virtual || !data.length || !groupSegments.length) return null;

      const currIdx = findCurrentGroupIndex(start);
      const currSeg = groupSegments[currIdx];
      const nextSeg = groupSegments[currIdx + 1];

      const currFirstItem = data[currSeg.startIndex];
      const currFirstKey = getItemKey(currFirstItem);
      if (currFirstKey === undefined) return null;

      const safeOffsetY = offsetY ?? 0;

      const currSize = getSize(currFirstKey);
      const currTopViewport = -safeOffsetY + currSize.top;

      let nextTopViewport = Number.POSITIVE_INFINITY;
      if (nextSeg) {
        const nextFirstItem = data[nextSeg.startIndex];
        const nextFirstKey = getItemKey(nextFirstItem);
        if (nextFirstKey !== undefined) {
          const nextSize = getSize(nextFirstKey);
          nextTopViewport = -safeOffsetY + nextSize.top;
        }
      }

      // Compute sticky translateY (with push effect)
      let top = 0;
      if (currTopViewport > 0) {
        top = currTopViewport;
      } else {
        top = Math.min(0, nextTopViewport - itemHeight);
      }

      const y = Math.round(top);

      // Collect current group items for header title
      const groupItems = data.slice(currSeg.startIndex, currSeg.endIndex + 1);
      const headerNode = (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${y}px)`,
          }}
        >
          {group.title(currSeg.key, groupItems)}
        </div>
      );

      // Underlay to prevent visual bleed-through under transparent header content
      const headerHeight = itemHeight;
      const underlayNode = (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            transform: `translateY(${y}px)`,
            background: 'var(--listy-header-bg, #fff)',
            pointerEvents: 'none',
          }}
        />
      );

      return (
        <Portal open getContainer={() => containerRef.current}>
          {underlayNode}
          {headerNode}
        </Portal>
      );
    },
    [
      sticky,
      group,
      rowKey,
      data,
      groupSegments,
      findCurrentGroupIndex,
      getItemKey,
      itemHeight,
    ],
  );

  const renderItem = React.useCallback(
    (item: T, index: number, props: any) => {
      if (!group) {
        return (
          <div key={index} style={props?.style}>
            {itemRender(item, index)}
          </div>
        );
      }

      const getGroupKey = (i: T): React.Key =>
        typeof group.key === 'function'
          ? (group.key as (it: T) => React.Key)(i)
          : group.key;

      const currentKey = getGroupKey(item);
      const prevKey = index > 0 ? getGroupKey(data[index - 1]) : null;

      const needHeader = index === 0 || currentKey !== prevKey;
      const seg = needHeader
        ? groupSegments.find((s) => s.startIndex === index)
        : null;
      const groupItems = seg
        ? data.slice(seg.startIndex, seg.endIndex + 1)
        : [];

      return (
        <div key={index} style={props?.style}>
          {needHeader && <div>{group.title(currentKey, groupItems)}</div>}
          <div>{itemRender(item, index)}</div>
        </div>
      );
    },
    [group, itemRender, data, groupSegments, itemHeight],
  );

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <VirtualList
        ref={listRef}
        data={data}
        fullHeight={false}
        itemHeight={itemHeight}
        itemKey={rowKey as any}
        height={height}
        extraRender={extraRender}
      >
        {(item, index, props) => renderItem(item, index, props)}
      </VirtualList>
    </div>
  );
}

const ListyWithForwardRef = forwardRef(Listy) as <T>(
  props: ListyProps<T> & { ref?: React.Ref<ListyRef> },
) => ReturnType<typeof Listy>;

export default ListyWithForwardRef;
