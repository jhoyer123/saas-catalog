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

/**
 * Calcula la fecha de expiración para una prueba gratuita (7 días)
 */
export const getTrialExpirationDate = (): Date => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 10);

  return expiryDate;
};
