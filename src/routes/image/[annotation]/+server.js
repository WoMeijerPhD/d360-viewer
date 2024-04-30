
import { getAnnotationPYByID } from '$lib/Supabase-functions.js';

export async function GET( {params}) {
	console.log('params', params);
	let annotationID = params.annotation;
	// if there is a file extension, remove it
	if(annotationID.includes('.')){
		annotationID = annotationID.split('.')[0];
	}
	const annotation = await getAnnotationPYByID(annotationID);

	return new Response(
		//redirect to the image
		annotation.image,
		{
			status: 302,
			headers: {
				'Location': annotation.imgurl,
				'Cache-Control': 'public, max-age=31536000, immutable',
			}
		}
	);
}

