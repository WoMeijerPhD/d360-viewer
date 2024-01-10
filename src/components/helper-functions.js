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


// export const randomColor = () => {
//     return "#" + Math.floor(Math.random() * 16777215).toString(16);
// }