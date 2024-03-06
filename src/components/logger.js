// logger.js


let data = [];
let headers = [];

export function clear() {
    data = [];
    // push the headers to the data
    data.push(headers);
}

export function setHeaders(newHeaders) {
    headers = newHeaders;
}

export function log(info) {
    data.push(info);
}

export function save() {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    // code to save the csv data to a file
    downloadCSV(csv, 'data.csv');
    
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

