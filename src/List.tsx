import * as React from 'react';
import { forwardRef } from 'react';
import RawList from './RawList';
import VirtualList from './VirtualList';
import type { ListyProps, ListyRef } from './interface';

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
