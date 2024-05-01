// make a function to add a new row to the viewers database and return the id

import {supabase} from "$lib/Supabase-Client";
import { v4 as uuidv4 } from 'uuid';
import { randomColor } from "./components/helper-functions";

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
        video_name:annotation.video,
        user_id: storedUID,
        fov: annotation.fov,
        color: annotation.color,
        equarecimg: annotation.equarecimg,
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
        console.log("annotation upserted", data);
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
export async function getAnnotationsByUser(userID,videoID){
    const { data, error } = await supabase
    .from('annotations')
    .select()
    .eq('user_id', userID)
    .eq('video_name',videoID)
    .eq('deleted', false);
    if(error){
        console.log("error getting annotations by user: ", error);
    }

    // for each item in data, set the supa_id to the id, and set uploaded to true
    data.forEach(item => {
        item.supa_id = item.id;
        item.uploaded = true;
        item.video = item.video_name;
        // convert the orientation to an object
        item.orientation = {pitch: item.orientation[0], yaw: item.orientation[1]};
        // if the color is not set, set it to a random color
        if(!item.color){
            item.color = randomColor();
        }
    });
    return data;
}

export async function getAnnotationPYByID(annotationID){
    const { data, error } = await supabase
    .from('annotations')
    .select()
    .eq('id', annotationID);
    if(error){
        console.log("error getting annotation by id: ", error);
    }
    if(data.length === 0){
        return null;
    }
    let item = data[0];
    item.orientation = {pitch: item.orientation[0], yaw: item.orientation[1]};

    return item;

}



export async function supaUploadImage(image, storedUID){

    // Convert image data URL to binary data
    const imageBlob = await fetch(image).then(response => response.blob());

    // generate a uuid for the image

    // Generate a UUID for the image
    const uuid = uuidv4();

    const fileName = `public/${storedUID}/${uuid}.png`;

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

     return (`https://swhufdbqgtxdxiseggrf.supabase.co/storage/v1/object/public/annotationBucket/${fileName}`);
}

export async function getVideo(videoID){
    const { data, error } = await supabase
    .from('videos')
    .select()
    .eq('id', videoID);
    if(error){
        console.log("error getting video by id: ", error);
    }
    if(data.length === 0){
        return null;
    }
    return data[0];
}