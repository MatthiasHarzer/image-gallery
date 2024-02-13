export const isNotNull = (value: any): value is NonNullable<typeof value> =>
  value !== null && value !== undefined;
