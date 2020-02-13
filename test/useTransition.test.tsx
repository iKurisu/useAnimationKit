import React, { useRef } from "react";
import { act } from "react-dom/test-utils";
import { mount, ReactWrapper } from "enzyme";
import useTransition from "../src/useTransition";

jest.useFakeTimers();

describe("useTransition", (): void => {
  const TestComponent = (): JSX.Element => {
    const div = useRef(null);

    const transition = useTransition(div, {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 500,
    });

    return <div onClick={transition} ref={div} style={{ opacity: 0 }} />;
  };

  let wrapper: ReactWrapper;

  beforeAll((): void => {
    wrapper = mount(<TestComponent />);
  });

  it("performs animation correctly", (): void => {
    act((): void => {
      wrapper.find("div").simulate("click");
    });

    jest.runAllTimers();

    expect(
      getComputedStyle(wrapper.find("div").getDOMNode()).getPropertyValue(
        "opacity",
      ),
    ).toBe("1");
  });
});
