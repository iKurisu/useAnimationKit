/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Properties,
  MappedProperties,
  MappedProperty,
  KeywordPropertyNames,
  UnitlessPropertyNames,
} from "./types";
import { applyEase } from "./utils";

const stringifyKeyword = (
  mappedProperty: MappedProperty,
  stage: number,
): string => {
  return stage === 0
    ? (mappedProperty.initial as string)
    : (mappedProperty.target as string);
};

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

const stringifyString = (
  mappedProperty: MappedProperty,
  stage: number,
): string => {
  const { initial, target, str } = mappedProperty;
  return str!.replace(
    /-?\d+(\.\d+)?(?!d)/gi,
    replaceFn(initial as number[], target as number[], stage),
  );
};

/**
 * Stringifies the given `MappedProperties`.
 * @param mappedProperties An object of `MappedProperty`.
 * @param ease The transition's stage.
 */
const stringifyProperties = (
  mappedProperties: MappedProperties,
  stage: number,
): Properties => {
  const properties = Object.keys(mappedProperties) as (keyof Properties)[];

  return properties.reduce((prev, curr) => {
    const props =
      curr in KeywordPropertyNames
        ? stringifyKeyword(mappedProperties[curr]!, stage)
        : curr in UnitlessPropertyNames
        ? stringifyUnitless(mappedProperties[curr]!, stage)
        : stringifyString(mappedProperties[curr]!, stage);

    return { ...prev, [curr]: props };
  }, {});
};

export default stringifyProperties;
