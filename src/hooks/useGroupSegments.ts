import * as React from 'react';
import type { Group } from '../interface';

export type { Group } from '../interface';

export interface GroupSegmentItem<T> {
  item: T;
  index: number;
}

/**
 * Build a lookup map from group key to all matching data items and their
 * original indexes.
 * This groups by key across the full data set and does not require items with
 * the same key to be contiguous.
 */
export default function useGroupSegments<T, K extends React.Key = React.Key>(
  data: T[],
  group?: Group<T, K>,
): Map<K, GroupSegmentItem<T>[]> {
  return React.useMemo(() => {
    const map = new Map<K, GroupSegmentItem<T>[]>();

    if (!group) {
      return map;
    }

    data.forEach((item, index) => {
      const groupKey = group.key(item);
      const groupItems = map.get(groupKey);
      const groupSegmentItem = { item, index };

      if (groupItems) {
        groupItems.push(groupSegmentItem);
      } else {
        map.set(groupKey, [groupSegmentItem]);
      }
    });

    return map;
  }, [data, group]);
}
