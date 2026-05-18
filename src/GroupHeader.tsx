import * as React from 'react';
import clsx from 'clsx';
import type { Group } from './hooks/useGroupSegments';

export interface GroupHeaderProps<T, K extends React.Key = React.Key> {
  group: Group<T, K>;
  groupKey: K;
  groupItems: T[];
  prefixCls: string;
  fixed?: boolean;
  sticky?: boolean;
  style?: React.CSSProperties;
}

export default function GroupHeader<T, K extends React.Key = React.Key>(
  props: GroupHeaderProps<T, K>,
) {
  const {
    group,
    groupKey,
    groupItems,
    prefixCls,
    fixed,
    sticky,
    style,
  } = props;

  const className = clsx(`${prefixCls}-group-header`, {
    [`${prefixCls}-group-header-sticky`]: sticky,
    [`${prefixCls}-group-header-fixed`]: fixed,
  });

  return (
    <div className={className} style={style}>
      {group.title(groupKey, groupItems)}
    </div>
  );
}
