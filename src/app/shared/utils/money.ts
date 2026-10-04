// Суммы хранятся целыми числами в копейках
export const toKopecks = (rubles: number) => Math.round(rubles * 100);
export const toRubles = (kopecks: number) => kopecks / 100;
