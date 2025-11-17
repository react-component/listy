import React, { useCallback, useMemo, useRef, useState } from 'react';
import Listy, { type ListyRef } from '@rc-component/listy';
import '../../assets/index.less';

interface RowItem {
  id: number;
  name: string;
}

const BATCH_SIZE = 30;
const LOAD_DELAY = 500;

const createBatch = (startId: number, count: number): RowItem[] =>
  Array.from({ length: count }, (_, index) => {
    const id = startId + index;
    return {
      id,
      name: `Row ${id}`,
    };
  });

export default () => {
  const listRef = useRef<ListyRef>(null);
  const nextIdRef = useRef(BATCH_SIZE + 1);

  const [items, setItems] = useState<RowItem[]>(() => createBatch(1, BATCH_SIZE));
  const [loading, setLoading] = useState(false);

  const appendItems = useCallback(() => {
    if (loading) {
      return;
    }

    setLoading(true);

    window.setTimeout(() => {
      setItems((prevItems) => {
        const newItems = createBatch(nextIdRef.current, BATCH_SIZE);
        nextIdRef.current += newItems.length;
        return [...prevItems, ...newItems];
      });

      setLoading(false);
    }, LOAD_DELAY);
  }, [loading]);

  const itemStyle = useMemo<React.CSSProperties>(
    () => ({
      padding: '0 12px',
      height: 32,
      lineHeight: '32px',
      borderBottom: '1px solid #efefef',
      background: '#fff',
    }),
    [],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Listy
        ref={listRef}
        height={560}
        itemHeight={32}
        items={items}
        rowKey="id"
        itemRender={(item) => (
          <div style={itemStyle}>{item.name}</div>
        )}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={appendItems} disabled={loading}>
          {loading ? 'Loading…' : 'Load More'}
        </button>
        <button
          onClick={() => {
            const lastItem = items[items.length - 1];
            if (!lastItem) {
              return;
            }
            listRef.current?.scrollTo({ key: lastItem.id, align: 'bottom' });
          }}
        >
          Scroll To Bottom
        </button>
        <span>Count: {items.length}</span>
      </div>
    </div>
  );
};

