import { writable } from "svelte/store";

const storedID = JSON.parse(localStorage.getItem("id"));
export const storedUID = writable(storedID);
storedUID.subscribe(value => {
    // localStorage.setItem("id", value === null ? 10 : value);
    // value === null ? value = 99999 : value = value;
    localStorage.setItem("id", JSON.stringify(value));
});