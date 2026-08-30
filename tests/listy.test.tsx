import React from 'react';
import Listy from '@rc-component/listy';
import { render, screen } from '@testing-library/react';
import ListyEntry from '../src/index';

const renderListy = () =>
  render(
    <Listy
      items={[{ id: 1 }]}
      rowKey="id"
      itemRender={(item) => <div>{item.id}</div>}
    />,
  );

describe('Listy', () => {
  it('should render', () => {
    renderListy();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { asFragment } = renderListy();
    expect(asFragment()).toMatchSnapshot();
  });

  it('supports functional rowKey', () => {
    const items = [{ value: 'foo' }, { value: 'bar' }];
    type Item = (typeof items)[number];
    const rowKey = jest.fn((item: Item) => item.value);

    render(
      <Listy
        items={items}
        rowKey={rowKey}
        itemRender={(item) => <div>{item.value}</div>}
      />,
    );

    expect(screen.getByText('foo')).toBeInTheDocument();
    expect(screen.getByText('bar')).toBeInTheDocument();
    expect(rowKey).toHaveBeenCalledWith(items[0]);
    expect(rowKey).toHaveBeenCalledWith(items[1]);
  });

  it('renders group headers with title callback', () => {
    const items = [
      { id: 1, group: 'A' },
      { id: 2, group: 'A' },
      { id: 3, group: 'B' },
    ];

    const titleMock = jest
      .fn()
      .mockImplementation((key: string, groupItems) => (
        <div data-testid={`group-${key}`}>
          Group {key} ({groupItems.length})
        </div>
      ));

    render(
      <Listy
        items={items}
        height={200}
        itemHeight={30}
        rowKey="id"
        group={{
          key: (item) => item.group,
          title: titleMock,
        }}
        itemRender={(item) => <div>Item {item.id}</div>}
      />,
    );

    expect(titleMock).toHaveBeenCalledTimes(2);
    expect(titleMock).toHaveBeenNthCalledWith(1, 'A', [items[0], items[1]]);
    expect(titleMock).toHaveBeenNthCalledWith(2, 'B', [items[2]]);

    expect(screen.getByTestId('group-A')).toHaveTextContent('Group A (2)');
    expect(screen.getByTestId('group-B')).toHaveTextContent('Group B (1)');
  });
});

describe('scrollWidth', () => {
  const renderWide = (
    scrollWidth?: number,
    styles?: React.ComponentProps<typeof Listy>['styles'],
  ) =>
    render(
      <Listy
        items={[
          { id: 1, group: 'A' },
          { id: 2, group: 'A' },
        ]}
        rowKey="id"
        height={100}
        itemHeight={20}
        scrollWidth={scrollWidth}
        styles={styles}
        group={{
          key: (item) => item.group,
          title: (key) => <span>{key}</span>,
        }}
        itemRender={(item) => <div>{item.id}</div>}
      />,
    );

  it('shows a horizontal scrollbar only when scrollWidth is set', () => {
    const { container, unmount } = renderWide(800);
    expect(
      container.querySelector('.rc-listy-scrollbar-horizontal'),
    ).toBeInTheDocument();
    unmount();

    expect(
      renderWide().container.querySelector('.rc-listy-scrollbar-horizontal'),
    ).not.toBeInTheDocument();
  });

  it('widens both row kinds to the content width', () => {
    const { container } = renderWide(800);

    expect(container.querySelector('.rc-listy-item')).toHaveStyle({
      width: '800px',
    });
    expect(container.querySelector('.rc-listy-group-header')).toHaveStyle({
      width: '800px',
    });
  });
});

describe('package entry point', () => {
  it('re-exports the Listy implementation', () => {
    expect(ListyEntry).toBe(Listy);
  });
});
