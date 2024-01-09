
const miroBoard = import.meta.env.VITE_MIRO_BOARD
const miroToken = import.meta.env.VITE_MIRO_TOKEN

export const timeMultiplier = 100;
export const userMultiplier = 600;

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

export async function uploadImageMiro(imgUrl, pos = [0, 0]) {
  const url = `https://api.miro.com/v2/boards/${miroBoard}/images`;

  const payload = {
    data: {
      url: imgUrl,
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
    const offset = calcXY(annotation.time, userid)
    // check if the annotation has a miroIDImage and miroIDText
    if(annotation.miroIDImage && annotation.miroIDText){
        console.log("updating miro");
        let resText = await updateTextMiro( annotation.text, annotation.miroIDText);
        console.log("miro text",resText);
    }
    else{
        let resImage = await uploadImageMiro(annotation.imgurl, offset);
        let resText = await uploadTextMiro(annotation.text, offset);
        console.log("miro image",resImage);
        console.log("miro text",resText);
        annotation.miroIDImage = resImage.id??'error';
        annotation.miroIDText = resText.id??'error';
    }
    return annotation;

}
