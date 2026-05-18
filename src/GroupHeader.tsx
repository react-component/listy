import * as React from 'react';
import clsx from 'clsx';
import type { Group } from './hooks/useGroupSegments';

export interface GroupHeaderProps<T, K extends React.Key = React.Key> {
  group: Group<T, K>;
  groupKey: K;
  groupItems: T[];
  prefixCls: string;
  sticky?: boolean;
  variant?: 'list' | 'sticky';
}

export default function GroupHeader<T, K extends React.Key = React.Key>(
  props: GroupHeaderProps<T, K>,
) {
  const {
    group,
    groupKey,
    groupItems,
    prefixCls,
    sticky,
    variant = 'list',
  } = props;

  const className = clsx(
    variant === 'sticky'
      ? `${prefixCls}-sticky-header`
      : `${prefixCls}-group-header`,
    {
      [`${prefixCls}-group-header-sticky`]: variant === 'list' && sticky,
    },
  );

  return <div className={className}>{group.title(groupKey, groupItems)}</div>;
}
