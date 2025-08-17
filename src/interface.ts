import * as React from "react";

export type ListyProps<T> = {
  items: T[];
  sticky?: boolean;
  height: number;
  rowKey: string | ((item: T) => string);
  itemRender: (item: T) => React.ReactNode;
  groupRender: {

  };
  onScrollEnd: (lastIndex: number) => void;
};

export type ListyItemProps<T> = {
  item: T;
  index: number;
};