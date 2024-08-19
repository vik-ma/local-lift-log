export const ConvertInputStringToNumber = (str: string): number => {
    if (str.trim().length === 0) return 0;

    return Number(str);
};
