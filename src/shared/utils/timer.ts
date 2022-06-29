export const sleep = (second: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, second * 1000));
