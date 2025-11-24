import * as React from 'react';
import type { Group } from '../interface';

export interface GroupSegment<K extends React.Key> {
  key: K;
  startIndex: number;
  endIndex: number;
}

/**
 * segments representing consecutive runs of items that share the same group key.
 */
export default function useGroupSegments<T, K extends React.Key = React.Key>(
  items: T[],
  group?: Group<T, K>,
): GroupSegment<K>[] {
  return React.useMemo(() => {
    if (!group || !items?.length) {
      return [];
    }

    const segments: GroupSegment<K>[] = [];
    let currentKey: K | null = null;
    let currentStart = -1;

    const getGroupKey = (item: T): K =>
      typeof group.key === 'function' ? group.key(item) : group.key;

    for (let i = 0; i < items.length; i += 1) {
      const gk = getGroupKey(items[i]);
      if (currentKey === null) {
        currentKey = gk;
        currentStart = i;
      } else if (gk !== currentKey) {
        segments.push({
          key: currentKey,
          startIndex: currentStart,
          endIndex: i - 1,
        });
        currentKey = gk;
        currentStart = i;
      }
    }

    if (currentKey !== null) {
      segments.push({
        key: currentKey,
        startIndex: currentStart,
        endIndex: items.length - 1,
      });
    }

    return segments;
  }, [items, group]);
}
