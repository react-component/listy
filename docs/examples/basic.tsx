import React, { useRef } from 'react';
import Listy, { type ListyRef } from '@rc-component/listy';
import '../../assets/index.less';

export default () => {
  const listRef = useRef<ListyRef>(null);
  const items = Array.from({ length: 200 }, (_, index) => {
    const groupItemsCount = 20;
    const groupIndex = Math.floor(index / groupItemsCount);
    return {
      id: index + 1,
      name: `${index} (group ${groupIndex})`,
      type: `Group ${groupIndex * groupItemsCount}`,
    };
  });

  const itemStyle: React.CSSProperties = {
    padding: '0 12px',
    height: 32,
    lineHeight: '32px',
    borderBottom: '1px solid rgb(79, 53, 53)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Listy
        height={320}
        itemHeight={32}
        items={items}
        itemRender={(item, index) => {
          return <div style={{ ...itemStyle,height:  30 + (index % 2 ? -3 : 10) }}>{item.name}</div>;
        }}
        rowKey="id"
        ref={listRef}
        sticky
        group={{
          key: (item) => item.type,
          title: (groupKey, groupItems) => (
            <div
              style={{
                fontWeight: 600,
                padding: '0 12px',
                height: 32,
                lineHeight: '32px',
                borderBottom: '1px solid #f5f5f5',
                backgroundColor: 'gray',
              }}
            >
              {groupKey}------{groupItems.length}
            </div>
          ),
        }}
      />

      <button
        onClick={() =>
          listRef.current?.scrollTo({
            key: 100,
            align: 'top',
          })
        }
      >
        Scroll To 100
      </button>
    </div>
  );
};
