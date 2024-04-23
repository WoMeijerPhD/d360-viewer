// a function that returns a random html color from a list of colors
export const randomColor = () => {
    const colors = [
        "#d84315",
        "#ff8f00",
        "#2e7d32",
        "#0277bd",
        "#283593",
        "#6a1b9a"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

const miro2html = {
    "gray":"gray",
    "light_yellow":"LightYellow",
    "yellow":"yellow",
    "orange":"orange",
    "light_green":"LightGreen",
    "green":"green",
    "dark_green":"DarkGreen",
    "cyan":"cyan",
    "light_pink":"LightPink",
    "pink":"pink",
    "violet":"violet",
    "red":"red",
    "light_blue":"LightBlue",
    "blue":"blue",
    "dark_blue":"Dark_Blue",
    "black":"black"
};

/** takes the miro color name and returns the html color */
export const miroColor2html = (miroColor) => {
    // check if the color is in the list
    if (!miro2html.hasOwnProperty(miroColor)) {
        return "LightYellow";
    }
    return miro2html[miroColor];
}

/** takes the html color name and returns the miro color */
export const htmlColor2miro = (htmlColor) => {
    for (let [key, value] of Object.entries(miro2html)) {
        if (value === htmlColor) {
            return key;
        }
    }
}

// a function that takes the pitch and yaw of the camera and returns the percentage of the total rotation
export function pitchYawToPercentage(pitch, yaw){
    // convert the pitch and yaw (in radians) to a percentage of the total rotation
    let pitchPercentage =1- ((pitch + Math.PI/2) / Math.PI)%1;
    let yawPercentage =1- ((yaw +Math.PI/2) / (2 * Math.PI))%1;
    return {pitch: pitchPercentage, yaw: yawPercentage};
}

export function percentageToPitchYaw(pitchPercentage, yawPercentage){
    // convert the percentage of the total rotation to pitch and yaw (in radians)
    let pitch = (1-pitchPercentage) * Math.PI - Math.PI/2;
    let yaw = (1-yawPercentage) * 2 * Math.PI - Math.PI/2;
    return {pitch: pitch, yaw: yaw};
}

// export const randomColor = () => {
//     return "#" + Math.floor(Math.random() * 16777215).toString(16);
// }