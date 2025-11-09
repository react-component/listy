import * as React from 'react';
import { ScrollTo } from 'rc-virtual-list/lib/List';

export interface ListyRef {
  scrollTo: ScrollTo;
}

export interface Group<T> {
  key: React.Key | ((item: T) => React.Key);
  title: (groupKey: React.Key, items: T[]) => React.ReactNode;
}

export interface ListyItemProps<T> {
  item: T;
  index: number;
}

export interface ListyProps<T> {
  items?: T[];
  sticky?: boolean;
  itemHeight?: number;
  height?: number;
  rowKey?: ((item: T) => React.Key) | Extract<keyof T, React.Key>;
  group?: Group<T>;
  virtual?: boolean;
  onEndReached?: () => void;
  itemRender: (item: T, index: number) => React.ReactNode;
  prefixCls?: string;
}
