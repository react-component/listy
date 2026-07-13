import React, { useRef, useState } from 'react';
import Listy, {
  type ListyRef,
  type ListyScrollToConfig,
  type ScrollAlign,
} from '@rc-component/listy';
import '../../assets/index.less';

const GROUP_SIZE = 15;
const GROUP_COUNT = 6;

interface Row {
  id: number;
  name: string;
  group: string;
}

const items: Row[] = Array.from(
  { length: GROUP_SIZE * GROUP_COUNT },
  (_, index) => ({
    id: index,
    name: `Item ${index}`,
    group: `Group ${Math.floor(index / GROUP_SIZE)}`,
  }),
);

const GROUP_KEYS = Array.from({ length: GROUP_COUNT }, (_, i) => `Group ${i}`);

const controlRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
};

export default () => {
  const listRef = useRef<ListyRef>(null);
  const [virtual, setVirtual] = useState(true);
  const [align, setAlign] = useState<ScrollAlign>('top');
  const [offset, setOffset] = useState(0);
  const [itemKey, setItemKey] = useState(50);
  const [groupKey, setGroupKey] = useState('Group 3');
  const [lastConfig, setLastConfig] = useState<ListyScrollToConfig>();

  // Single entry point so the demo can echo the exact config it passes in.
  const run = (config: ListyScrollToConfig) => {
    setLastConfig(config);
    listRef.current?.scrollTo(config);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={controlRow}>
        <label>
          <input
            type="checkbox"
            checked={virtual}
            onChange={(e) => setVirtual(e.target.checked)}
          />{' '}
          virtual
        </label>

        <label>
          align{' '}
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value as ScrollAlign)}
          >
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="auto">auto</option>
          </select>
        </label>

        <label>
          offset{' '}
          <input
            type="number"
            value={offset}
            style={{ width: 64 }}
            onChange={(e) => setOffset(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      {/* number | { top } — absolute pixel scroll */}
      <div style={controlRow}>
        <button type="button" onClick={() => run(0)}>
          scrollTo(0)
        </button>
        <button type="button" onClick={() => run(400)}>
          scrollTo(400)
        </button>
        <button type="button" onClick={() => run({ top: 200 })}>
          scrollTo({'{ top: 200 }'})
        </button>
      </div>

      {/* { key, align, offset } — scroll to an item */}
      <div style={controlRow}>
        <label>
          key{' '}
          <input
            type="number"
            value={itemKey}
            style={{ width: 64 }}
            onChange={(e) => setItemKey(Number(e.target.value) || 0)}
          />
        </label>
        <button
          type="button"
          onClick={() => run({ key: itemKey, align, offset })}
        >
          scrollTo item
        </button>

        {/* { groupKey, align, offset } — scroll to a group header */}
        <label>
          group{' '}
          <select value={groupKey} onChange={(e) => setGroupKey(e.target.value)}>
            {GROUP_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => run({ groupKey, align, offset })}
        >
          scrollTo group
        </button>
      </div>

      <div>
        last config:{' '}
        <code>{lastConfig === undefined ? '—' : JSON.stringify(lastConfig)}</code>
      </div>

      <Listy
        // Remount on mode switch so both branches start from a clean scroll.
        key={virtual ? 'virtual' : 'raw'}
        ref={listRef}
        virtual={virtual}
        height={360}
        itemHeight={40}
        items={items}
        rowKey="id"
        sticky
        itemRender={(item, index) => {
          const height = 40 + (index % 3) * 16;
          return (
            <div
              style={{
                padding: '0 16px',
                height,
                lineHeight: `${height}px`,
                borderBottom: '1px solid #f0f0f0',
                background: '#fff',
              }}
            >
              {item.name}
            </div>
          );
        }}
        group={{
          key: (item) => item.group,
          title: (key, groupItems) => (
            <div
              style={{
                padding: '10px 16px',
                fontWeight: 600,
                background: '#e6f4ff',
                borderBottom: '1px solid #91caff',
              }}
            >
              {key} · {groupItems.length} items
            </div>
          ),
        }}
      />
    </div>
  );
};
