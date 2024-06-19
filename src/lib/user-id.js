import {addViewer} from '../lib/Supabase-functions.js';

export async function getUserId(){
    // see is there is an id in local storage
		const storedID = JSON.parse(localStorage.getItem("id"));
		// if there is no user ID create a new one:
		if (!storedID){
			console.log('no id found, requesting new id');
			return await getNewID();
		} else {
			return storedID;
		}
}

export async function newUserId(){
		const newID = await addViewer();
		localStorage.setItem("id", JSON.stringify(newID));
		return newID;	
}