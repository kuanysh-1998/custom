export enum TariffPrefix {
    Trial = "F",
    Starter = "S",

    M10 = "M10",
    M50 = "M50",
    M100 = "M100",
    M250 = "M250",
    M500 = "M500",
    M1000 = "M1000",
    M2000 = "M2000",

    Y10 = "Y10",
    Y50 = "Y50",
    Y100 = "Y100",
    Y250 = "Y250",
    Y500 = "Y500",
    Y1000 = "Y1000",
    Y2000 = "Y2000",
}

export interface OptimalTariff {
    name: string,
    employeeMaxNumber: number,
    clientPrice: number,
    partnerPrice: number,
    prefixes: TariffPrefix[],
    days: number  
}
