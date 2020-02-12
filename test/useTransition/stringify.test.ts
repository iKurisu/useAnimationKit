import stringifyProperties from "../../src/useTransition/stringify";
import { Properties, MappedProperties } from "../../src/useTransition/types";

describe("stringifyProperties", (): void => {
  it("turns an object into a string property", (): void => {
    const properties = {
      transform: {
        initial: [0],
        target: [100],
        str: "translateX(0%)",
      },
      opacity: {
        initial: 1,
        target: 0,
      },
    };

    const stringifiedProperties: Properties = {
      transform: "translateX(0%)",
      opacity: 1,
    };

    const stringifiedProperties2: Properties = {
      transform: "translateX(100%)",
      opacity: 0,
    };

    expect(stringifyProperties(properties, 0)).toMatchObject(
      stringifiedProperties,
    );

    expect(stringifyProperties(properties, 1)).toMatchObject(
      stringifiedProperties2,
    );
  });

  it("handles multiple values", (): void => {
    const properties: MappedProperties = {
      transform: {
        initial: [0, 1],
        target: [100, 2],
        str: "translateX(0%) scaleX(1)",
      },
    };

    const stringifiedProperties: Properties = {
      transform: "translateX(0%) scaleX(1)",
    };

    const stringifiedProperties2: Properties = {
      transform: "translateX(100%) scaleX(2)",
    };

    expect(stringifyProperties(properties, 0)).toMatchObject(
      stringifiedProperties,
    );

    expect(stringifyProperties(properties, 1)).toMatchObject(
      stringifiedProperties2,
    );
  });

  it("stringifies width, top, bottom, etc. properties", (): void => {
    const mappedProps: MappedProperties = {
      width: {
        initial: [256],
        target: [100],
        str: "256px",
      },
      top: {
        initial: [5],
        target: [10],
        str: "5%",
      },
    };

    const from = { width: "256px", top: "5%" };
    const to = { width: "100px", top: "10%" };

    expect(stringifyProperties(mappedProps, 0)).toMatchObject(from);
    expect(stringifyProperties(mappedProps, 1)).toMatchObject(to);
    expect(stringifyProperties(mappedProps, 0.5)).toMatchObject({
      width: "178px",
      top: "7.5%",
    });
  });
});
