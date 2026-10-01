import * as React from 'react';
import type { RowKey } from '../List';

export default function useItemKey<T>(rowKey: RowKey<T>) {
  return React.useCallback(
    (item: T, index: number): React.Key =>
      typeof rowKey === 'function'
        ? rowKey(item, index)
        : (item[rowKey] as React.Key),
    [rowKey],
  );
}
