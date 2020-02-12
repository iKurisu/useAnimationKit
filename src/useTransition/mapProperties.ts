import {
  Properties,
  MappedProperty,
  KeywordPropertyNames,
  UnitlessPropertyNames,
} from "./types";

/**
 * Maps a `KeywordProperty` or a `UnitlessProperty`.
 */
const mapProperty = (
  property: keyof Properties,
  from: number | string,
  to: number | string,
): MappedProperty => ({
  property,
  initial: from,
  target: to,
});

/**
 * Maps a `StringProperty`.
 */
const mapStringProperties = (
  property: keyof Properties,
  from: string,
  to: string,
): MappedProperty => {
  const initial = from.match(/-?\d+(\.\d+)?(?!d)/gi);
  const target = to.match(/-?\d+(\.\d+)?(?!d)/gi);

  if (initial === null || target === null) {
    throw Error("Invalid property value.");
  }

  return {
    property,
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
const mapProperties = (from: Properties, to: Properties): MappedProperty[] => {
  const properties = Object.keys(from) as (keyof Properties)[];

  properties.forEach(property => {
    if (to[property] === undefined) {
      throw Error(`Missing target ${to} value.`);
    }
  });

  return properties.map(prop => {
    // No non null assertion rules is disabled since neither from[prop] nor
    // to[prop] can be null

    const props =
      prop in KeywordPropertyNames || prop in UnitlessPropertyNames
        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          mapProperty(prop, from[prop]!, to[prop]!)
        : mapStringProperties(prop, from[prop] as string, to[prop] as string);

    return props;
  }, {});
};

export default mapProperties;
