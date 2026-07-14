import React, { useState } from 'react';
import Listy from '@rc-component/listy';
import '../../assets/index.less';

export default () => {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl');
  const [virtual, setVirtual] = useState(true);

  const rtl = direction === 'rtl';
  const groupSize = 10;
  const total = 120;
  const items = Array.from({ length: total }, (_, index) => ({
    id: index + 1,
    index,
    groupIndex: Math.floor(index / groupSize),
  }));

  const itemStyle: React.CSSProperties = {
    padding: '0 12px',
    height: 32,
    lineHeight: '32px',
    borderBottom: '1px solid #efefef',
    background: '#fff',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setDirection((d) => (d === 'rtl' ? 'ltr' : 'rtl'))}
        >
          direction: {direction}
        </button>
        <button type="button" onClick={() => setVirtual((v) => !v)}>
          virtual: {String(virtual)}
        </button>
      </div>
      <Listy
        height={320}
        itemHeight={32}
        items={items}
        virtual={virtual}
        direction={direction}
        rowKey="id"
        sticky
        group={{
          key: (item) => item.groupIndex,
          title: (groupKey) => (
            <div
              style={{
                height: 40,
                lineHeight: '40px',
                padding: '0 12px',
                fontWeight: 600,
                background: '#f5f5f5',
              }}
            >
              {rtl ? `مجموعة ${groupKey}` : `Group ${groupKey}`}
            </div>
          ),
        }}
        itemRender={(item) => (
          <div style={itemStyle}>
            {rtl ? `العنصر ${item.index}` : `Item ${item.index}`}
          </div>
        )}
      />
    </div>
  );
};
