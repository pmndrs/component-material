export const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key]
export const setKeyValue = <T, K extends keyof T>(obj: T, key: K, value: any): T[K] => (obj[key] = value)
