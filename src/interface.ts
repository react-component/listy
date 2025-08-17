import * as React from "react";
import { ScrollTo } from "rc-virtual-list/lib/List";

export interface ListyRef {
  scrollTo: ScrollTo;
}

export interface ListyGroupRender<T> {
  groupKey: string | ((item: T) => string | number);
  renderTitle: (
    groupKey: string | number,
    items: T[]
  ) => React.ReactNode;
}

export interface ListyItemProps<T> {
  item: T;
  index: number;
}

export interface ListyProps<T> {
  items?: T[];
  sticky?: boolean;
  height?: number;
  rowKey?: string | ((item: T) => string);
  itemRender: (item: T, index: number) => React.ReactNode;
  groupRender?: ListyGroupRender<T>;
  onScrollEnd?: () => void;
}