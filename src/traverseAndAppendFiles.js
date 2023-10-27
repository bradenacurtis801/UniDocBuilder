const fs = require('fs');
const path = require('path');
const getCommentDelimiter = require('./getCommentDelimiter.js');

// ANSI escape codes for colors
const fsPromises = fs.promises;
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

/**
 * Traverse a directory recursively and append file contents to an output file.
 *
 * @param {string} rootPath - The root directory to start traversal (default is the current directory).
 * @param {string} outputPath - The output file path (default is 'output.txt').
 * @param {string[]} ignoreList - An array of filenames or directory names to ignore during traversal.
 */
async function traverseAndAppendFiles(
  rootPath,
  outputPath,
  ignoreList,
  fullPath,
  event
) {
  
  const outputStream = fs.createWriteStream(outputPath, { flags: "w" });

  async function processFile(rootDirectory, filePath) {
    try {
      const fileContent = await fsPromises.readFile(filePath, "utf8");
      const relativePath = path.relative(rootDirectory, filePath);
      const delimiter = getCommentDelimiter(relativePath);

      outputStream.write(`\n\n${delimiter} === ${relativePath} ===\n\n`);
      outputStream.write(fileContent);
    } catch (error) {
      if (error.code === "EBUSY") {
        console.error(`File is currently busy or locked: ${filePath}`);
      } else {
        console.error(`Error processing file ${filePath}:`, error.message);
      }
    }
  }

  async function traverseDirectory(dirPath) {
    const files = await fsPromises.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fsPromises.stat(filePath);
      const f = fullPath ? filePath : file;

      const isIgnored = ignoreList.includes(file)

      if (isIgnored) {
        console.log(`${RED}Rejected: ${f}${RESET}`);
        event.reply('message-to-renderer', {
            type: 'log',
            message: `Rejected: ${f}`,
            status: 'rejected'
        });
      } else {
        console.log(`${GREEN}Accepted: ${f}${RESET}`);
        event.reply('message-to-renderer', {
            type: 'log',
            message: `Accepted: ${f}`,
            status: 'accepted'
        });
      }

      if (isIgnored) continue;

      if (stats.isDirectory() && path.basename(filePath) !== "node_modules") {
        await traverseDirectory(filePath);
      } else if (stats.isFile()) {
        await processFile(rootPath, filePath);
      }
    }
  }

  await traverseDirectory(rootPath);
  outputStream.end();
}
module.exports = traverseAndAppendFiles

