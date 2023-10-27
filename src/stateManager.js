let fileStructure = {};

function setFileStructure(data) {
    fileStructure = data;
}

function getFileStructure() {
    return fileStructure;
}

module.exports = { setFileStructure, getFileStructure };
