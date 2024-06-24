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
        // try and load the annotation from the database
        let annotation = await getAnnotationPYByID(annotationID);
        // if the annotation is not found, return a 404
        if(!annotation) return error(404, 'Not found');
        // get the video name
        let videoName = annotation.video_name;

        return redirect(302, `https://d360-viewer.netlify.app/viewer/${videoName}/${annotationID}?session_id=${annotation.session}`);
    }


    return error(404, 'Not found');
}