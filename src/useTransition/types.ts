export type Visibility = "visible" | "hidden" | "collapse";

export enum KeywordPropertyNames {
  visibility = "visibility",
}

type KeywordProperties = {
  visibility?: Visibility;
};

export enum UnitlessPropertyNames {
  opacity,
  strokeDashoffset,
  zIndex,
}

type UnitlessProperties = {
  [k in keyof typeof UnitlessPropertyNames]?: number;
};

export enum StringPropertyNames {
  width,
  height,
  transform,
  top,
  left,
  right,
  bottom,
  marginTop,
  marginRight,
  marginLeft,
  marginBottom,
}

type StringProperties = { [k in keyof typeof StringPropertyNames]?: string };

export type Properties = KeywordProperties &
  UnitlessProperties &
  StringProperties;

export interface MappedProperty {
  initial: string | number | number[];
  target: string | number | number[];
  str?: string;
}

// export interface MappedProperty {
//   function?: string;
//   initialValue: number;
//   targetValue: number;
//   unit?: string;
// }

export interface MappedProperties {
  opacity?: MappedProperty;
  transform?: MappedProperty;
  height?: MappedProperty;
  width?: MappedProperty;
  top?: MappedProperty;
  left?: MappedProperty;
  right?: MappedProperty;
  bottom?: MappedProperty;
  marginTop?: MappedProperty;
  marginLeft?: MappedProperty;
  marginRight?: MappedProperty;
  marginBottom?: MappedProperty;
  strokeDashoffset?: MappedProperty;
  zIndex?: MappedProperty;
  visibility?: MappedProperty;
}
