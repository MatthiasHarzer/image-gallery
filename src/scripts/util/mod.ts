
export const saveMod = (n: number, m: number): number => {
  return (n % m + m) % m;
}
