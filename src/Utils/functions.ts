export const newArray = <T>(length: number, value?: T): T[] =>
  Array.from({ length }, () => (value !== undefined ? value : (null as T)));

export const setIndex = <T>(arr: T[], idx: number, value: T) => [
  ...arr.slice(0, idx),
  value,
  ...arr.slice(idx + 1),
];

export const unbreakable = (str: string) => str.replace(" ", "\u00A0"); // Non breaking space

export const hideImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.style.display = "none";
};

export const parseToPST = (dateString: string) => {
  return new Date(
    new Date(dateString).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
};

export const getNextDeadline = (deadlines: Record<string, string>) =>
  Object.entries(deadlines)
    .filter(([_, value]) => parseToPST(value) > new Date())
    .sort((a, b) => parseToPST(a[1]).getTime() - parseToPST(b[1]).getTime())[0];
