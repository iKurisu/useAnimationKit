import mapProperties from "../../src/useTransition/mapProperties";

describe("mapProperties", (): void => {
  it("maps properties into an object", (): void => {
    const { from, to } = {
      from: { transform: "translateX(50%)", opacity: 1 },
      to: { transform: "translateX(0%)", opacity: 0 },
    };

    const mappedProps = [
      {
        property: "transform",
        initial: [50],
        target: [0],
        str: "translateX(50%)",
      },
      {
        property: "opacity",
        initial: 1,
        target: 0,
      },
    ];

    expect(mapProperties(from, to)).toMatchObject(mappedProps);
  });

  it("handles negative numbers", (): void => {
    const { from, to } = {
      from: { transform: "translateX(-100%)" },
      to: { transform: "translateX(0)" },
    };

    const mappedProps = [
      {
        property: "transform",
        initial: [-100],
        target: [0],
        str: "translateX(-100%)",
      },
    ];

    expect(mapProperties(from, to)).toMatchObject(mappedProps);
  });

  it("handles properties with multiple values", (): void => {
    const { from, to } = {
      from: { transform: "translateX(0%) scaleX(1)" },
      to: { transform: "translateX(100%) scaleX(2)" },
    };

    const mappedProps = [
      {
        property: "transform",
        initial: [0, 1],
        target: [100, 2],
        str: "translateX(0%) scaleX(1)",
      },
    ];

    expect(mapProperties(from, to)).toMatchObject(mappedProps);
  });

  it("handles functionless properties, such as width, top...", (): void => {
    const from = { width: "256px", top: "5%" };
    const to = { width: "100px", top: "10%" };

    const mappedProps = [
      {
        property: "width",
        initial: [256],
        target: [100],
        str: "256px",
      },
      {
        property: "top",
        initial: [5],
        target: [10],
        str: "5%",
      },
    ];

    expect(mapProperties(from, to)).toMatchObject(mappedProps);
  });

  it("handles keywords properties", (): void => {
    const from = { visibility: "visible" as "visible" };
    const to = { visibility: "hidden" as "hidden" };

    const mappedProps = [
      {
        property: "visibility",
        initial: "visible",
        target: "hidden",
      },
    ];

    expect(mapProperties(from, to)).toMatchObject(mappedProps);
  });
});
