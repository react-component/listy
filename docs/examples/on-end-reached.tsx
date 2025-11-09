import React, { useCallback, useMemo, useRef, useState } from 'react';
import Listy, { type ListyRef } from '@rc-component/listy';
import '../../assets/index.less';

interface RowItem {
  id: number;
  name: string;
}

export default () => {
  const listRef = useRef<ListyRef>(null);

  const TOTAL = 200;
  const PAGE_SIZE = 40;

  const [items, setItems] = useState<RowItem[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({ id: i + 1, name: `Row ${i}` })),
  );
  const [loading, setLoading] = useState(false);

  const hasMore = items.length < TOTAL;

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    setTimeout(() => {
      setItems((prev) => {
        const start = prev.length;
        const next = Array.from({ length: Math.min(PAGE_SIZE, TOTAL - prev.length) }, (_, i) => {
          const id = start + i + 1;
          return { id, name: `Row ${id - 1}` };
        });
        return [...prev, ...next];
      });
      setLoading(false);
    }, 800);
  }, [loading, hasMore]);

  const itemStyle: React.CSSProperties = useMemo(
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
        onEndReached={loadMore}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() =>
            listRef.current?.scrollTo({ key: Math.max(1, items.length - 1), align: 'top' })
          }
        >
          Scroll To Near End
        </button>
        <span>
          Count: {items.length} / {TOTAL}
        </span>
        {loading && <span>Loading…</span>}
        {!hasMore && <span>· No more</span>}
      </div>
    </div>
  );
};


