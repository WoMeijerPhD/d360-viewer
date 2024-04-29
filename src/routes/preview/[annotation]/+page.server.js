export const ssr = true;
export const csr = false;
// export const hydrate = false;
// export const prerender = true;
import { error } from '@sveltejs/kit';
import {getAnnotationPYByID} from '$lib/Supabase-functions.js';


/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {

    if(params.annotation){
        // try to load the annotation from the database
        const annotation = await getAnnotationPYByID(params.annotation);
        // if the annotation is not found, return a 404
        if(!annotation) return error(404, 'Not found');
        // return the annotation
        return {
                annotation
        }

    }


    return error(404, 'Not found');
}