import React, { useRef, useState } from 'react';
import Listy, {
  type ListyRef,
  type ListyClassNames,
  type ListyStyles,
} from '@rc-component/listy';
import '../../assets/index.less';

const GROUPS = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'infra', label: 'Infrastructure' },
  { id: 'mobile', label: 'Mobile' },
];

interface Task {
  id: string;
  name: string;
  groupId: string;
}

const items: Task[] = GROUPS.flatMap((group) =>
  Array.from({ length: 8 }, (_, index) => ({
    id: `${group.id}-${index}`,
    name: `${group.label} task #${index + 1}`,
    groupId: group.id,
  })),
);

// The `classNames` and `styles` props share the same semantic slots:
// `root`, `item`, and `groupHeader` (including the sticky clone).
const classNames: ListyClassNames = {
  root: 'listy-semantic-root',
  groupHeader: 'listy-semantic-header',
  item: 'listy-semantic-item',
};

// Inline `styles` stack on top of the classNames above.
const styles: ListyStyles = {
  root: { borderRadius: 10 },
  groupHeader: { letterSpacing: 0.5 },
  item: { transition: 'background 0.15s ease' },
};

const CSS = `
.listy-semantic-root {
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #fff;
  font-family: system-ui, sans-serif;
}
.listy-semantic-header {
  padding: 10px 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}
.listy-semantic-item {
  padding: 0 16px;
  line-height: 40px;
  border-bottom: 1px solid #f3f4f6;
}
.listy-semantic-item:hover {
  /* hover state — only a className slot can express this, not inline styles */
  background: #f5f3ff;
}
`;

export default () => {
  const listRef = useRef<ListyRef>(null);
  const [virtual, setVirtual] = useState(true);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={virtual}
            onChange={(event) => setVirtual(event.target.checked)}
          />
          virtual — the same classNames / styles apply in both render modes
        </label>
        <Listy
          ref={listRef}
          height={360}
          itemHeight={40}
          items={items}
          rowKey="id"
          sticky
          virtual={virtual}
          classNames={classNames}
          styles={styles}
          itemRender={(item) => item.name}
          group={{
            key: (item) => item.groupId,
            title: (groupKey) =>
              GROUPS.find((group) => group.id === groupKey)?.label ?? groupKey,
          }}
        />
      </div>
    </>
  );
};
