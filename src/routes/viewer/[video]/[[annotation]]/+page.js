export const ssr = false;
import {getVideo} from '$lib/Supabase-functions';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    let annotationID = null;
    let video = null;
    if(params.annotation){
        annotationID = params.annotation;
        // if there is a file extension, remove it
        if(annotationID.includes('.')){
            annotationID = annotationID.split('.')[0];
        }
    }
    if(params.video){
        let videoID = params.video;
        // find the video
        video = await getVideo(videoID);
    }
    else{
        video = "https://axxrj9ldvusx.objectstorage.eu-amsterdam-1.oci.customer-oci.com/n/axxrj9ldvusx/b/bucket-20240111-0932/o/bike_ride.mp4"
    }
   
    // return the 
    return {
        props: {
            video,
            annotationID
        }
    };
}