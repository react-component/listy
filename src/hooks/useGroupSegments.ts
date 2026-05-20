import * as React from 'react';

export interface Group<T, K extends React.Key = React.Key> {
  key: (item: T) => K;
  title: (groupKey: K, items: T[]) => React.ReactNode;
}

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
