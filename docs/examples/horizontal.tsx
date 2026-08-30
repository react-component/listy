import React, { useRef, useState } from 'react';
import Listy, { type ListyRef } from '@rc-component/listy';
import '../../assets/index.less';

const COLUMNS = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: 'Name', width: 200 },
  { key: 'email', title: 'Email', width: 260 },
  { key: 'address', title: 'Address', width: 320 },
  { key: 'note', title: 'Note', width: 240 },
];

const SCROLL_WIDTH = COLUMNS.reduce((acc, col) => acc + col.width, 0);
const VIEWPORT_WIDTH = 480;
const GROUP_SIZE = 10;
const TOTAL = 200;

const items = Array.from({ length: TOTAL }, (_, index) => ({
  id: index + 1,
  index,
  groupIndex: Math.floor(index / GROUP_SIZE),
}));

const cellStyle: React.CSSProperties = {
  flex: 'none',
  padding: '0 12px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  borderInlineEnd: '1px solid #f0f0f0',
  boxSizing: 'border-box',
};

export default () => {
  const listRef = useRef<ListyRef>(null);
  const [virtual, setVirtual] = useState(true);
  const [sticky, setSticky] = useState(true);
  const [grouped, setGrouped] = useState(true);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [scrollWidth, setScrollWidth] = useState(SCROLL_WIDTH);

  const renderRow = (cells: React.ReactNode[], background: string) => (
    <div
      style={{
        display: 'flex',
        width: scrollWidth,
        height: 32,
        lineHeight: '32px',
        background,
        borderBottom: '1px solid #efefef',
      }}
    >
      {COLUMNS.map((col, i) => (
        <div key={col.key} style={{ ...cellStyle, width: col.width }}>
          {cells[i]}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setVirtual((v) => !v)}>
          virtual: {String(virtual)}
        </button>
        <button type="button" onClick={() => setGrouped((g) => !g)}>
          group: {String(grouped)}
        </button>
        <button type="button" onClick={() => setSticky((s) => !s)}>
          sticky: {String(sticky)}
        </button>
        <button
          type="button"
          onClick={() => setDirection((d) => (d === 'ltr' ? 'rtl' : 'ltr'))}
        >
          direction: {direction}
        </button>
        <label>
          scrollWidth:{' '}
          <input
            type="number"
            step={100}
            value={scrollWidth}
            style={{ width: 80 }}
            onChange={(e) => setScrollWidth(Number(e.target.value))}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => listRef.current?.scrollTo({ left: 0 })}
        >
          scrollTo left: 0
        </button>
        <button
          type="button"
          onClick={() => listRef.current?.scrollTo({ left: 300 })}
        >
          scrollTo left: 300
        </button>
        <button
          type="button"
          onClick={() =>
            listRef.current?.scrollTo({ left: scrollWidth, top: 0 })
          }
        >
          scrollTo left: end
        </button>
        <button
          type="button"
          onClick={() => listRef.current?.scrollTo({ key: 150 })}
        >
          scrollTo key: 150
        </button>
      </div>

      <div style={{ width: VIEWPORT_WIDTH, border: '1px solid #d9d9d9' }}>
        <Listy
          ref={listRef}
          height={320}
          itemHeight={32}
          items={items}
          virtual={virtual}
          direction={direction}
          rowKey="id"
          sticky={sticky}
          scrollWidth={scrollWidth}
          group={
            grouped
              ? {
                  key: (item) => item.groupIndex,
                  title: (groupKey) =>
                    renderRow(
                      [
                        `G${groupKey}`,
                        `Group ${groupKey}`,
                        '',
                        'header should follow horizontal scroll',
                        '',
                      ],
                      '#f5f5f5',
                    ),
                }
              : undefined
          }
          itemRender={(item) =>
            renderRow(
              [
                item.id,
                `User ${item.index}`,
                `user${item.index}@example.com`,
                `No.${item.index} Some Long Street, Some City`,
                `note-${item.index}`,
              ],
              '#fff',
            )
          }
        />
      </div>
    </div>
  );
};
