import * as React from 'react';
import { forwardRef } from 'react';
import RawList from './RawList';
import VirtualList from './VirtualList';
import type { Group } from './hooks/useGroupSegments';

// ============================== Types ===============================
export type RowKey<T> = keyof T | ((item: T) => React.Key);

export type ScrollAlign = 'top' | 'bottom' | 'auto';

export interface GroupScrollToConfig {
  groupKey: React.Key;
  align?: ScrollAlign;
  offset?: number;
}

export interface KeyScrollToConfig {
  key: React.Key;
  align?: ScrollAlign;
  offset?: number;
}

export interface PositionScrollToConfig {
  left?: number;
  top?: number;
}

export type ListyScrollToConfig =
  | number
  | null
  | KeyScrollToConfig
  | PositionScrollToConfig
  | GroupScrollToConfig;

export interface ListyRef {
  scrollTo: (config?: ListyScrollToConfig) => void;
}

export interface ListyProps<T, K extends React.Key = React.Key> {
  items?: T[];
  sticky?: boolean;
  itemHeight?: number;
  height?: number;
  group?: Group<T, K>;
  virtual?: boolean;
  prefixCls?: string;
  rowKey: RowKey<T>;
  onScroll?: React.UIEventHandler<HTMLElement>;
  itemRender: (item: T, index: number) => React.ReactNode;
}

export interface ListComponentProps<T, K extends React.Key = React.Key> {
  data: T[];
  sticky?: boolean;
  itemHeight?: number;
  height?: number;
  group?: Group<T, K>;
  prefixCls: string;
  rowKey: RowKey<T>;
  onScroll?: React.UIEventHandler<HTMLElement>;
  itemRender: (item: T, index: number) => React.ReactNode;
}

function Listy<T, K extends React.Key = React.Key>(
  props: ListyProps<T, K>,
  ref: React.Ref<ListyRef>,
) {
  // ============================== Props ==============================
  const { items, virtual = true, prefixCls = 'rc-listy', ...restProps } = props;

  // =============================== Data ===============================
  const data = React.useMemo(() => items || [], [items]);

  // ============================== Render ===============================
  const sharedListProps = {
    ...restProps,
    data,
    prefixCls,
  };

  const listNode =
    virtual === false ? (
      <RawList
        ref={ref}
        {...sharedListProps}
      />
    ) : (
      <VirtualList
        ref={ref}
        {...sharedListProps}
      />
    );

  return (
    <div className={prefixCls}>
      {listNode}
    </div>
  );
}

// Const to support generic with forwardRef
const ListyWithForwardRef = forwardRef(Listy) as <
  T,
  K extends React.Key = React.Key,
>(
  props: ListyProps<T, K> & { ref?: React.Ref<ListyRef> },
) => React.ReactElement;

export default ListyWithForwardRef;
