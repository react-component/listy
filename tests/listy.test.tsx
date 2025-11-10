import React from 'react';
import Listy from '@rc-component/listy';
import { render, screen } from '@testing-library/react';

describe('Listy', () => {
  const renderListy = () =>
    render(
      <Listy
        items={[{ id: 1 }]}
        rowKey="id"
        itemRender={(item) => <div>{item.id}</div>}
      />,
    );

  it('should render', () => {
    renderListy();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { asFragment } = renderListy();
    expect(asFragment()).toMatchSnapshot();
  });
});