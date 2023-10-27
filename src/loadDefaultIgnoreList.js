const fs = require('fs');
const path = require('path'); // Import the 'path' module

function loadDefaultIgnoreList(pathToFile) {
    try {
      // const defaultIgnoreListPath = path.join(
      //   __dirname,
      //   pathToFile
      // );
      const defaultIgnoreListPath = pathToFile
      const defaultIgnoreList = JSON.parse(
        fs.readFileSync(defaultIgnoreListPath, "utf8")
      );
      return defaultIgnoreList;
    } catch (error) {
      console.error("Error loading default ignore list:", error.message);
      return { filenames: [], extensions: [], hidden: [] }; // Return an empty structure
    }
  }

  module.exports = loadDefaultIgnoreList