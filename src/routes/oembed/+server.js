import { json } from '@sveltejs/kit';
import {getAnnotationPYByID} from '$lib/Supabase-functions.js';


export async function GET({url}) {
	// get the url parameter
	const annotationID = url.searchParams.get('annotationID');
	// get the annotation from the database
	const annotation = await getAnnotationPYByID(annotationID);
	// create a new oembed response with the annotation details


	return new Response(
		JSON.stringify({
			
				"version": "1.0",
				"type": "link",
				"title": annotation.text,
				// "url": annotation.image_url,

				// "url": `https://d360-viewer.netlify.app/?annoID=${annotationID}`,
				"author_name": annotation.user_id,
				"provider_name": "d360",
				"provider_url": "https://d360-viewer.netlify.app/"
			
		}),
		
		 {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}