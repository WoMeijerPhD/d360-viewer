import { json } from '@sveltejs/kit';
import {getAnnotationPYByID} from '$lib/Supabase-functions.js';


export async function GET({url}) {
	// get the url parameter
	const pageURL = url.searchParams.get('url');
	// get the annotation id from the url, for example http://d360-viewer.netlify.app/oembed?url=https%3A%2F%2Fd360-viewer.netlify.app%2F%3FannoID%3D9c6971a4-0fc9-4280-a4cc-c01a76c35a79&format=json
	const annotationID = pageURL.split('annoID=')[1];
	// if there is no annotation id, return a 404
	if(!annotationID) return new Response('Not found', { status: 404 });
	// get the annotation from the database
	const annotation = await getAnnotationPYByID(annotationID);
	// create a new oembed response with the annotation details


	return new Response(
		JSON.stringify({
			
				"version": "1.0",
				"type": "photo",
				"title": annotation.text,
				"url": annotation.image_url,
				"width": 800,
				"height": 600,
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