declare module API {
    type prefOption = "opt" | "backup"
    export interface StoreAction {
            action: "CREATE" | "READ" | "UPDATE",
            field: "usage" | "generation" | "pref" | `pref.${prefOption}`,
            val: number|string
    }
}