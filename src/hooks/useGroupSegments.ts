import * as React from 'react';
import type { Group } from '../interface';

export interface GroupSegment {
  key: React.Key;
  startIndex: number;
  endIndex: number;
}

export default function useGroupSegments<T>(
  items: T[],
  group?: Group<T>,
): GroupSegment[] {
  return React.useMemo(() => {
    if (!group || !items?.length) {
      return [];
    }

    const segments: GroupSegment[] = [];
    let currentKey: React.Key | null = null;
    let currentStart = -1;

    const getGroupKey = (item: T): React.Key =>
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
