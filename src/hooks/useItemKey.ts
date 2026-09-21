import type * as React from 'react';
import { useEvent } from '@rc-component/util';
import type { RowKey } from '../List';

export default function useItemKey<T>(rowKey: RowKey<T>) {
  return useEvent((item: T, index: number): React.Key =>
    typeof rowKey === 'function'
      ? rowKey(item, index)
      : (item[rowKey] as React.Key),
  );
}
