import {
  Properties,
  MappedProperty,
  KeywordPropertyNames,
  UnitlessPropertyNames,
} from "./types";
import { applyEase } from "./utils";

/**
 * Stringifies `KeywordProperties`.
 */
const stringifyKeyword = (
  mappedProperty: MappedProperty,
  stage: number,
): string => {
  return stage === 0
    ? (mappedProperty.initial as string)
    : (mappedProperty.target as string);
};

/**
 * Stringifies `UnitlessProperties`.
 */
const stringifyUnitless = (
  mappedProperty: MappedProperty,
  stage: number,
): number => {
  const { initial, target } = mappedProperty;
  return applyEase(initial as number, target as number, stage);
};

const replaceFn = (
  initial: number[],
  target: number[],
  stage: number,
): (() => string) => {
  let index = 0;

  return (): string =>
    applyEase(initial[index], target[index++], stage).toString();
};

/**
 * Stringifies `StringProperties`.
 */
const stringifyString = (
  mappedProperty: MappedProperty,
  stage: number,
): string => {
  const { initial, target, str } = mappedProperty;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return str!.replace(
    /-?\d+(\.\d+)?(?!d)/gi,
    replaceFn(initial as number[], target as number[], stage),
  );
};

/**
 * Stringifies the given array of `MappedProperty`.
 * @param mappedProperties An array of `MappedProperty`.
 * @param stage The transition's stage.
 */
const stringifyProperties = (
  mappedProperties: MappedProperty[],
  stage: number,
): Properties => {
  return mappedProperties.reduce((prev, mappedProperty) => {
    const { property } = mappedProperty;

    const props =
      property in KeywordPropertyNames
        ? stringifyKeyword(mappedProperty, stage)
        : property in UnitlessPropertyNames
        ? stringifyUnitless(mappedProperty, stage)
        : stringifyString(mappedProperty, stage);

    return { ...prev, [property]: props };
  }, {});
};

export default stringifyProperties;
