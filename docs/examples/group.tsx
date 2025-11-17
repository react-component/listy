import React, { useRef } from 'react';
import Listy, { type ListyRef } from '@rc-component/listy';
import '../../assets/index.less';

export default () => {
  const listRef = useRef<ListyRef>(null);

  const groupSize = 12;
  const total = 240;
  const groupCount = Math.ceil(total / groupSize);
  const groupKeys = React.useMemo(
    () => Array.from({ length: groupCount }, (_, index) => `G${index}`),
    [groupCount],
  );

  const items = Array.from({ length: total }, (_, index) => {
    const groupIndex = Math.floor(index / groupSize);
    return {
      id: index + 1,
      name: `Row ${index}`,
      groupId: `G${groupIndex}`,
    };
  });

  const itemStyle: React.CSSProperties = {
    padding: '0 12px',
    borderBottom: '1px solid #efefef',
    background: '#fff',
  };

  function renderHeader(groupKey: string, groupItems: typeof items) {
    const groupIndex = Number(groupKey.slice(1));
    const heights = [32, 56, 80];
    const h = heights[groupIndex % heights.length];
    return (
      <div
        style={{
          height: h,
          padding: '0 12px',
          fontWeight: 600,
          background: 'rgba(250, 250, 250)',
          borderBottom: '1px solid #eaeaea',
        }}
      >
        Group {groupKey} (size: {groupItems.length})
      </div>
    );
  }

  const scrollToGroup = (groupKey: string) => {
    listRef.current?.scrollTo({ groupKey, align: 'top' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => scrollToGroup('G0')}>
          Scroll to first group
        </button>
        <button
          type="button"
          onClick={() => scrollToGroup(`G${groupCount - 1}`)}
        >
          Scroll to last group
        </button>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          maxHeight: 120,
          overflow: 'auto',
        }}
      >
        {groupKeys.map((groupKey) => (
          <button
            type="button"
            key={groupKey}
            onClick={() => scrollToGroup(groupKey)}
          >
            Scroll to {groupKey}
          </button>
        ))}
      </div>
      <Listy
        height={360}
        itemHeight={32}
        items={items}
        rowKey="id"
        sticky
        virtual
        itemRender={(item, index) => {
          const heights = [30, 42, 54];
          const h = heights[index % heights.length];
          return (
            <div style={{ ...itemStyle, height: h, lineHeight: `${h}px` }}>
              {item.name} · {item.groupId}
            </div>
          );
        }}
        group={{
          key: (item) => item.groupId,
          title: (groupKey, groupItems) => renderHeader(groupKey, groupItems),
        }}
        ref={listRef}
      />
    </div>
  );
};
