/**
 * Returns the first non empty array provided, assuming that at least one
 * the them is not empty.
 */
export const notEmpty = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.length ? arr1 : arr2;
};

/**
 * Merges two arrays into a new one without duplicated values.
 */
export const mergeWithoutDupicates = <T>(arr1: T[], arr2: T[]): T[] => {
  const mergedArray: T[] = [...arr1, ...arr2];

  return mergedArray.filter(
    (value: T, index: number): boolean => mergedArray.indexOf(value) === index,
  );
};
