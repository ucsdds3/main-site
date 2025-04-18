export const newArray = <T>(length: number, value: T): T[] => Array.from({ length }, () => value);

export const setIndex = <T>(arr: T[], idx: number, value: T) => [
  ...arr.slice(0, idx),
  value,
  ...arr.slice(idx + 1),
];

export const unbreakable = (str: string) => str.replace(" ", "\u00A0"); // Non breaking space
