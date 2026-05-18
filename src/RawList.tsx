import * as React from 'react';
import type { ListRef, ScrollTo } from '@rc-component/virtual-list';
import GroupHeader from './GroupHeader';
import type { Row } from './hooks/useFlattenRows';
import type { GroupSegmentItem, Group } from './hooks/useGroupSegments';

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

type ScrollConfig = NonNullable<Parameters<ScrollTo>[0]>;
type ScrollPositionConfig = Extract<ScrollConfig, { left?: number; top?: number }>;
type ScrollKeyConfig = Extract<ScrollConfig, { key: React.Key }>;

function isScrollPositionConfig(
  config: ScrollConfig,
): config is ScrollPositionConfig {
  return typeof config === 'object' && ('left' in config || 'top' in config);
}

function isScrollKeyConfig(config: ScrollConfig): config is ScrollKeyConfig {
  return typeof config === 'object' && 'key' in config;
}

function getElementTop(container: HTMLElement, element: HTMLElement) {
  return (
    element.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop
  );
}

function RawList<T, K extends React.Key = React.Key>(
  props: RawListProps<T, K>,
  ref: React.Ref<ListRef>,
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

  const holderRef = React.useRef<HTMLDivElement>(null);
  const keyElementMapRef = React.useRef(new Map<React.Key, HTMLElement>());
  const indexElementMapRef = React.useRef(new Map<number, HTMLElement>());

  const registerElement = React.useCallback(
    (key: React.Key, rowIndex: number, element: HTMLElement | null) => {
      if (element) {
        keyElementMapRef.current.set(key, element);
        indexElementMapRef.current.set(rowIndex, element);
      } else {
        keyElementMapRef.current.delete(key);
        indexElementMapRef.current.delete(rowIndex);
      }
    },
    [],
  );

  const scrollToElement = React.useCallback(
    (
      element: HTMLElement,
      align: 'top' | 'bottom' | 'auto' = 'top',
      offset = 0,
    ) => {
      const holder = holderRef.current as HTMLDivElement;

      const elementTop = getElementTop(holder, element);
      const elementBottom = elementTop + element.offsetHeight;
      const scrollBottom = holder.scrollTop + holder.clientHeight;

      if (align === 'auto') {
        if (elementTop < holder.scrollTop) {
          holder.scrollTop = elementTop - offset;
        } else if (elementBottom > scrollBottom) {
          holder.scrollTop = elementBottom - holder.clientHeight + offset;
        }
        return;
      }

      holder.scrollTop =
        align === 'bottom'
          ? elementBottom - holder.clientHeight + offset
          : elementTop - offset;
    },
    [],
  );

  const scrollTo: ScrollTo = React.useCallback(
    (config) => {
      const holder = holderRef.current;
      if (!holder || config == null) {
        return;
      }

      if (typeof config === 'number') {
        holder.scrollTop = config;
        return;
      }

      if (isScrollPositionConfig(config)) {
        if (config.left !== undefined) {
          holder.scrollLeft = config.left;
        }
        if (config.top !== undefined) {
          holder.scrollTop = config.top;
        }
        return;
      }

      const targetElement = isScrollKeyConfig(config)
        ? keyElementMapRef.current.get(config.key)
        : indexElementMapRef.current.get(config.index);

      if (targetElement) {
        scrollToElement(targetElement, config.align, config.offset);
      }
    },
    [scrollToElement],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      nativeElement: holderRef.current,
      scrollTo,
      getScrollInfo: () => ({
        x: holderRef.current?.scrollLeft || 0,
        y: holderRef.current?.scrollTop || 0,
      }),
    }),
    [scrollTo],
  );

  const renderItem = React.useCallback(
    (item: T, index: number, rowIndex: number) => {
      const row = { type: 'item', item, index } as Row<T, K>;
      const key = getKey(row);
      const node = itemRender(item, index);
      const setRef = (element: HTMLElement | null) => {
        registerElement(key, rowIndex, element);
      };

      if (React.isValidElement(node)) {
        return React.cloneElement(node as React.ReactElement<any>, {
          key,
          ref: setRef,
        });
      }

      return (
        <div key={key} ref={setRef}>
          {node}
        </div>
      );
    },
    [getKey, itemRender, registerElement],
  );

  let rowIndex = 0;
  const rawContent = group
    ? Array.from(groupData).map(([groupKey, groupItems]) => {
        const headerRow = { type: 'header', groupKey } as Row<T, K>;
        const key = getKey(headerRow);
        const groupRowIndex = rowIndex;
        const currentGroupItems = groupKeyToItems.get(groupKey) || [];

        rowIndex += 1;

        return (
          <section
            key={key}
            className={`${prefixCls}-group-section`}
            ref={(element) => registerElement(key, groupRowIndex, element)}
          >
            <GroupHeader
              group={group}
              groupKey={groupKey}
              groupItems={currentGroupItems}
              prefixCls={prefixCls}
              sticky={sticky}
            />
            {groupItems.map(({ item, index }) => {
              const itemNode = renderItem(item, index, rowIndex);
              rowIndex += 1;
              return itemNode;
            })}
          </section>
        );
      })
    : data.map((item, index) => {
        const itemNode = renderItem(item, index, rowIndex);
        rowIndex += 1;
        return itemNode;
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
  props: RawListProps<T, K> & { ref?: React.Ref<ListRef> },
) => React.ReactElement;

export default RawListWithRef;
