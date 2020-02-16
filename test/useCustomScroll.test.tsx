import React, { useRef } from "react";
import { mount, ReactWrapper } from "enzyme";
import useCustomScroll from "../src/useCustomScroll";
import "./__mocks__/clientHeight";

describe("useCustomScroll", (): void => {
  const TestComponent = (): JSX.Element => {
    const element = useRef<HTMLDivElement | null>(null);
    const listener = useRef<HTMLDivElement | null>(null);

    const [scroll, subscribe, unsubscribe, manualScroll] = useCustomScroll(
      element,
      {
        distance: 100,
        duration: 0,
        timing: [0, 0, 0.1, 1],
      },
    );

    const scrollContent = (scroll: number): void => {
      if (listener.current) {
        listener.current.style.transform = `translateY(${100 - scroll}px)`;
      }
    };

    subscribe(scrollContent);

    const unsubscribeListener = (): void => {
      unsubscribe(scrollContent);
    };

    const scrollManually = (): void => manualScroll({ to: 200, duration: 0 });

    return (
      <div className="scroll" {...scroll} onClick={unsubscribeListener}>
        <div
          className="scroll-content"
          ref={element}
          style={{ transform: "translateY(0)" }}
        >
          <div className="manual-scroller" onClick={scrollManually} />
          <div className="scroll-listener" ref={listener} />
        </div>
      </div>
    );
  };

  const WithLimits = (): JSX.Element => {
    const element = useRef(null);

    const [scroll] = useCustomScroll(element, {
      distance: 10000,
      duration: 0,
      limitMod: {
        top: (): number => -200,
        bottom: (): number => window.innerHeight + 600,
      },
    });

    return (
      <div className="scroll" {...scroll}>
        <div
          className="scroll-content"
          ref={element}
          style={{ transform: "translateY(0)" }}
        />
      </div>
    );
  };

  const WithoutRef = (): JSX.Element => {
    const element = useRef(null);

    const [scroll] = useCustomScroll(element, { distance: 100, duration: 0 });

    return <div {...scroll} />;
  };

  const expectTransformToBe = (selector: string) => (
    wrapper: ReactWrapper,
    value: string,
  ): void =>
    expect(
      getComputedStyle(wrapper.find(selector).getDOMNode()).getPropertyValue(
        "transform",
      ),
    ).toBe(value);

  const expectContentTransformToBe = expectTransformToBe(".scroll-content");
  const expectListenerTransformToBe = expectTransformToBe(".scroll-listener");

  it("updates styles when the user scrolls", (): void => {
    const wrapper = mount(<TestComponent />);

    expectContentTransformToBe(wrapper, "translateY(0)");

    wrapper.find(".scroll").simulate("wheel", { deltaY: 100 });

    expectContentTransformToBe(wrapper, "translateY(-100px)");
    expectListenerTransformToBe(wrapper, "translateY(0px)");
  });

  it("updates styles when the user touches the screen", (): void => {
    const wrapper = mount(<TestComponent />);
    const scroll = wrapper.find(".scroll");

    scroll.simulate("touchStart", { touches: [{ clientY: 200 }] });
    scroll.simulate("touchMove", { touches: [{ clientY: 190 }] });

    expectContentTransformToBe(wrapper, "translateY(-10px)");
    expectListenerTransformToBe(wrapper, "translateY(90px)");

    scroll.simulate("touchEnd");

    expectContentTransformToBe(wrapper, "translateY(-610px)");
    expectListenerTransformToBe(wrapper, "translateY(-510px)");
  });

  it("unsubscribes listener", (): void => {
    const wrapper = mount(<TestComponent />);
    const scroll = wrapper.find(".scroll");

    scroll.simulate("click");
    scroll.simulate("wheel", { deltaY: 100 });
    expectListenerTransformToBe(wrapper, "");
  });

  it("scrolls correctly through manual scroll", (): void => {
    const wrapper = mount(<TestComponent />);
    const manualScroller = wrapper.find(".manual-scroller");

    manualScroller.simulate("click");
    expectContentTransformToBe(wrapper, "translateY(-200px)");
  });

  it("handles limits", (): void => {
    const wrapper = mount(<WithLimits />);
    const scroll = wrapper.find(".scroll");

    scroll.simulate("wheel", { deltaY: -100 });
    expectContentTransformToBe(wrapper, "translateY(200px)");

    scroll.simulate("wheel", { deltaY: 100 });
    scroll.simulate("wheel", { deltaY: 100 });
    expectContentTransformToBe(wrapper, "translateY(-3100px)");
  });

  it("throws a custom error when the ref passed has not been asigned an html element", (): void => {
    jest.spyOn(console, "error").mockImplementation((): void => undefined);

    expect((): ReactWrapper => mount(<WithoutRef />)).toThrowError(
      "The given ref does not have an html element assigned.",
    );

    jest.restoreAllMocks();
  });
});
