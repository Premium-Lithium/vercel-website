export interface GeneralKPI {
    name: string,
    value: string, // no calculations should be run on a KPI
    prevValue?: string, // value for previous period
    change?: number, // change percentage
}