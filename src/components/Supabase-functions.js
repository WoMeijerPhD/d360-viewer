// make a function to add a new row to the viewers database and return the id

import {supabase} from "../components/Supabase-Client";

export async function addViewer() {
    const { data, error } = await supabase
        .from("viewers")
        .insert([{ nickname: "new viewer" }])
        .select();
    if (error) {
        console.log("error creating new user: ",error);
    }

    return data[0].id;
}
