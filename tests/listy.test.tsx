import React from "react";
import Listy from "@rc-component/listy";
import { render, screen } from "@testing-library/react";

describe("Listy", () => {
  it("should render", () => {
    render(<Listy items={[{ id: 1 }]} itemRender={(item) => <div>{item.id}</div>} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});