import * as React from 'react';
import type { RowKey } from '../List';

export default function useItemKey<T>(rowKey: RowKey<T>) {
  return React.useCallback(
    (item: T): React.Key =>
      typeof rowKey === 'function' ? rowKey(item) : (item[rowKey] as React.Key),
    [rowKey],
  );
}
