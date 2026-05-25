import * as React from 'react';
import clsx from 'clsx';
import type { Group } from './hooks/useGroupSegments';

// ============================== Types ===============================
export interface GroupHeaderProps<T, K extends React.Key = React.Key> {
  group: Group<T, K>;
  groupKey: K;
  groupItems: T[];
  prefixCls: string;
  fixed?: boolean;
  sticky?: boolean;
  style?: React.CSSProperties;
}

function GroupHeader<T, K extends React.Key = React.Key>(
  props: GroupHeaderProps<T, K>,
  ref: React.Ref<HTMLDivElement>,
) {
  // ============================== Props ==============================
  const {
    group,
    groupKey,
    groupItems,
    prefixCls,
    fixed,
    sticky,
    style,
  } = props;

  // ============================= Classes =============================
  const className = clsx(`${prefixCls}-group-header`, {
    [`${prefixCls}-group-header-sticky`]: sticky,
    [`${prefixCls}-group-header-fixed`]: fixed,
  });

  // ============================== Render ==============================
  return (
    <div ref={ref} className={className} style={style}>
      {group.title(groupKey, groupItems)}
    </div>
  );
}

const GroupHeaderWithRef = React.forwardRef(GroupHeader) as <
  T,
  K extends React.Key = React.Key,
>(
  props: GroupHeaderProps<T, K> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

export default GroupHeaderWithRef;
