/**
 * convert to ISO string for input type datetime-local
 * @param date
 * @returns
 */
export const dateConvert = (date: Date | null | undefined): string => {
  if (!date) return "";

  const dataConverted = new Date(date);
  return dataConverted.toISOString();
};
