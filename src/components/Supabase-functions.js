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

export async function upsertAnnotation(annotation, storedUID){

    let supaAnnotation ={
        text: annotation.text,
        orientation:[
            annotation.orientation.pitch,
             annotation.orientation.yaw
        ],
 
        imgurl: annotation.imgurl,
        time: annotation.time,
        video_name:"test.mp4",
        miroIDText: annotation.miroIDText,
        miroIDImage: annotation.miroIDImage,
        user_id: storedUID,
        fov: annotation.fov,
    }
    // if the annotation has a supa_id, use that to update the database
    if(annotation.supa_id){
        supaAnnotation.id = annotation.supa_id;
    }
    const { data, error } = await supabase
        .from("annotations")
        .upsert([supaAnnotation])
        .select();
    if (error) {
        console.log("error upserting annotation: ",error);
    }
    else{
        console.log("annotation upserted");
    }
    // return the annotation with the id from the database
    return {supa_id: data[0].id, ...annotation};
}

export async function deleteAnnotation(annotation){
    // if the annotation does not have a supa_id, just return
    if(!annotation.supa_id){
        console.log("annotation does not have a supa_id");
        return;
    }


    const { data, error } = await supabase
    .from('annotations')
    .update({ deleted: true,
        miroIDText: null,
        miroIDImage: null })
    .eq('id', annotation.supa_id)
    .select()

    if (error) {
        console.log("error deleting annotation: ",error);
    }
    return data[0];

}

export async function supaUpload(annotation, storedUID){
    const imageURL = annotation.perscanvas.toDataURL('image/png');
    // Convert image data URL to binary data
    const imageBlob = await fetch(imageURL).then(response => response.blob());


    const fileName = `public/${storedUID}/${annotation.id}.png`;

    const { data, error } = await supabase
    .storage
    .from('annotationBucket')
    .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: true
    });
    // console.log("data:", data);
    if(error){
        console.log("error uploading to supabase", error);
    }

    // time to get the public URL
    // TODO: make this use the supabase command, currently it doesnt work
    // const { urldata, urlerror } = supabase
    // .storage
    // .from('annotationBucket')
    // .getPublicUrl(fileName)
    // console.log("urldata:", urldata);
    // if(urlerror){
    // 	console.log("error getting url from supabase", urlerror);
    // }
    // //... but this works!
    // console.log("test url:",`https://swhufdbqgtxdxiseggrf.supabase.co/storage/v1/object/public/annotationBucket/${fileName}`);
    return (`https://swhufdbqgtxdxiseggrf.supabase.co/storage/v1/object/public/annotationBucket/${fileName}`);
}