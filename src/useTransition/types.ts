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
  property: keyof Properties;
  initial: string | number | number[];
  target: string | number | number[];
  str?: string;
}
