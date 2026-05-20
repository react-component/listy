import type * as React from 'react';

export type RowKey<T> = keyof T | ((item: T) => React.Key);

export type ScrollAlign = 'top' | 'bottom' | 'auto';

export interface Group<T, K extends React.Key = React.Key> {
  key: (item: T) => K;
  title: (groupKey: K, items: T[]) => React.ReactNode;
}

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
