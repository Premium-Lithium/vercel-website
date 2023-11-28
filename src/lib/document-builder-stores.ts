import { writable, type Writable } from "svelte/store";

export enum PageState {
    Landing,
    DnoApplication,
    Contract
}

export let currentState: Writable<number> = writable(0)