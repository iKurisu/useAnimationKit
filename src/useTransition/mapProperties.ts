import {
  Properties,
  MappedProperty,
  MappedProperties,
  KeywordPropertyNames,
  UnitlessPropertyNames,
} from "./types";

/**
 * Maps a `KeywordProperty` or a `UnitlessProperty`.
 */
const mapProperty = (
  from: number | string,
  to: number | string,
): MappedProperty => ({
  initial: from,
  target: to,
});

/**
 * Maps a `StringProperty`.
 */
const mapStringProperties = (from: string, to: string): MappedProperty => {
  const initial = from.match(/-?\d+(\.\d+)?(?!d)/gi);
  const target = to.match(/-?\d+(\.\d+)?(?!d)/gi);

  if (initial === null || target === null) {
    throw Error("Invalid property value.");
  }

  return {
    initial: initial.map(parseFloat),
    target: target.map(parseFloat),
    str: from,
  };
};

/**
 * Maps properties into a `MappedProperties` object.
 * @param from The initial properties.
 * @param to The target properties.
 */
const mapProperties = (from: Properties, to: Properties): MappedProperties => {
  const properties = Object.keys(from) as (keyof Properties)[];

  properties.forEach(property => {
    if (to[property] === undefined) {
      throw Error(`Missing target ${to} value.`);
    }
  });

  return properties.reduce((prev: MappedProperties, curr) => {
    // No non null assertion rules is disabled since neither from[curr] nor
    // to[curr] can be null

    const props =
      curr in KeywordPropertyNames || curr in UnitlessPropertyNames
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          mapProperty(from[curr]!, to[curr]!)
        : mapStringProperties(from[curr] as string, to[curr] as string);

    return { ...prev, ...{ [curr]: props } };
  }, {});
};

export default mapProperties;
