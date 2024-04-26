
const miroBoard = import.meta.env.VITE_MIRO_BOARD
const miroToken = import.meta.env.VITE_MIRO_TOKEN

export const timeMultiplier = 100;
export const userMultiplier = 600;
export const bottomOffset = 400;

export function calcXY(time, user){
    return [time * timeMultiplier, user * userMultiplier];
}

const header = {
  "accept": "application/json",
  "content-type": "application/json",
  "authorization": `Bearer ${miroToken}`
};

export async function uploadTextMiro(text, pos = [0, 0]) {

  const url = `https://api.miro.com/v2/boards/${miroBoard}/sticky_notes`;

  const payload = {
    data: {
      content: text,
    },
    position: {
      origin: "center",
      x: pos[0],
      y: pos[1]
    }
  };

  const response = fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(payload)
  });

  return await response.then(res => res.json());
}
export async function updateTextMiro(text, id) {
      
      fetch(`https://api.miro.com/v2/boards/${miroBoard}/sticky_notes/${id}`, {
        method: 'PATCH',
        headers: header,
        body: JSON.stringify({data: {content: text}})
      })
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
  }

export async function uploadImageMiro(imgUrl,imgTitle='test-title', pos = [0, 0]) {
  const url = `https://api.miro.com/v2/boards/${miroBoard}/images`;

  const payload = {
    data: {
      url: imgUrl,
      title: imgTitle
    },
    position: {
      origin: "center",
      x: pos[0],
      y: pos[1]
    }
  };

  const response = fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(payload)
  });

  return await response.then(res => res.json());
}

export function test(){
    console.log("board", miroBoard);
    console.log("token", miroToken);
}

export async function miroUploadAnnotation(annotation, userid){
  console.log("uploading annotation", annotation, userid)
    const img_offset = calcXY(annotation.time, userid)
    const text_offset = [img_offset[0], img_offset[1] - bottomOffset]
    // check if the annotation has a miroIDImage and miroIDText
    if(annotation.miroIDImage && annotation.miroIDText){
      // if it does, update the miro elements
        let resText = await updateTextMiro( annotation.text, annotation.miroIDText);
    }
    else{
      // if it does not, upload the miro elements
        let resImage = await uploadImageMiro(annotation.imgurl, annotation.supa_id, img_offset);
        let resText = await uploadTextMiro(annotation.text, text_offset);
        annotation.miroIDImage = resImage.id??'error';
        annotation.miroIDText = resText.id??'error';
    }
    return annotation;

}

export async function newUserLabel(userid, text = userid){
    let offset = calcXY(-10, userid);
    let res = await uploadTextMiro(text, offset);
    return (res);
}

function createURL(annotation){
    return (`https://d360-viewer.netlify.app/?time=${annotation.time}&yaw=${annotation.orientation.yaw}&pitch=${annotation.orientation.pitch}`);
}


export async function deleteSticky(itemID){
    console.log("deleting item", itemID);
    let res = await fetch(`https://api.miro.com/v2/boards/${miroBoard}/sticky_notes/${itemID}`, {
        method: 'DELETE',
        headers: header,
    });
    return res;
}

export async function deleteImage(itemID){
    console.log("deleting item", itemID);
    let res = await fetch(`https://api.miro.com/v2/boards/${miroBoard}/images/${itemID}`, {
        method: 'DELETE',
        headers: header,
    });
    return res;
}

// create a list of possible miro elements
const miroElements = [
    "images",
    "sticky_notes"

];


export async function miroCommand(element, content, pos = {x:0, y:0}, method = "POST") {
  // check if element is an accepted element
  if(!miroElements.includes(element)){
      console.log("element not supported");
      return;
  }
  // todo: check if content is valid for element


    const url = `https://api.miro.com/v2/boards/${miroBoard}/${element}`;

    const payload = {
        data: content,
        x: pos.x,
        y: pos.y,
    };

    const response = fetch(url, {
        method: method,
        headers: header,
        body: JSON.stringify(payload)
    });

    return await response.then(res => res.json());
}