import {getAnnotationPYByID} from '$lib/Supabase-functions.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    
    if(params.annotation){
        let annotationID = params.annotation;
        // if there is a file extension, remove it
        if(annotationID.includes('.')){
            annotationID = annotationID.split('.')[0];
        }
        return redirect(302, `https://d360-viewer.netlify.app/?annoID=${annotationID}`);
        // // try to load the annotation from the database
        // const annotation = await getAnnotationPYByID(annotationID);
        // // if the annotation is not found, return a 404
        // if(!annotation) return error(404, 'Not found');
        // // return the annotation
        // return {
        //         annotation
        // }

    }


    return error(404, 'Not found');
}