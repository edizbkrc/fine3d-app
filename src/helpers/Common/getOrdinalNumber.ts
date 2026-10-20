

export const getOrdinalNumber = (num: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = num % 100;
  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
};

export const getFloorText = (
  floorNumber: number,
  locale: string,
  t: (key: string, values?: any) => string
): string => {
  if (locale === "en") {
    return `${getOrdinalNumber(floorNumber)} Floor`;
  } else {
    return t("FloorWithNumber", { number: floorNumber });
  }
};
