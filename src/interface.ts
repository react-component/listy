import type * as React from 'react';
import type { ScrollTo } from 'rc-virtual-list/lib/List';
import type { GetKey } from 'rc-virtual-list/lib/interface';

export interface ListyRef {
  scrollTo: ScrollTo;
}

export type RowKey<T> = keyof T | ((item: T) => React.Key);

export interface Group<T, K extends React.Key = React.Key> {
  key: ((item: T) => K) | K;
  title: (groupKey: K, items: T[]) => React.ReactNode;
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
  onEndReached?: () => void;
  itemRender: (item: T, index: number) => React.ReactNode;
}

export type { GetKey };
