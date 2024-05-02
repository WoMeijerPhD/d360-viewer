
import {getVideos} from '$lib/Supabase-functions';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    let videos = await getVideos();
   
    // return the 
    return {
        videos
    };
}