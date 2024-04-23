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


// export const randomColor = () => {
//     return "#" + Math.floor(Math.random() * 16777215).toString(16);
// }