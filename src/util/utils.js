const { readFile, mkdtemp } = require("fs/promises");
const { tmpdir } = require("os");
const { join, extname } = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);


// Function to extract text from a .pptx file
async function extractTextFromPPTX(pptFilePath) {
  const getTextExtractor = (await import("office-text-extractor"))
    .getTextExtractor;
  const extractor = getTextExtractor();
  return extractor.extractText({ input: pptFilePath, type: "file" });
}

async function convertPPTtoPPTX(inputFilePath) {
    try {
        // Create a temporary directory
        const tempDir = await mkdtemp(join(tmpdir(), "ppt_conversion-"));

        // The base filename of the input file
        const inputFileName = basename(inputFilePath);

        // The path to the file in the temporary directory
        const tempInputFilePath = join(tempDir, inputFileName);

        // Copy the input file to the temporary directory
        await copyFile(inputFilePath, tempInputFilePath);

        // Generate a temporary .pptx file path
        const tempPPTXFilePath = join(tempDir, "temp.pptx");

        // Docker command to convert the file
        const command = `docker run --rm -v "${tempDir}:/data" ghcr.io/unoconv/unoserver-docker unoconvert /data/${inputFileName} /data/${tempPPTXFilePath}"`;

        const { stderr } = await exec(command);

        if (stderr) {
            console.error(`Error converting .ppt to .pptx: ${stderr}`);
            return null;
        } else {
            console.log(`Conversion successful: ${tempPPTXFilePath}`);
            return tempPPTXFilePath;
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
        return null;
    }
}
  

async function extractTextFromPPT(inputFilePath) {
  const ext = extname(inputFilePath).toLowerCase();

  if (ext === ".ppt") {
    const tempPPTXFilePath = await convertPPTtoPPTX(inputFilePath);

    if (tempPPTXFilePath) {
      // Call extractTextFromPPTX to extract text from the temporary .pptx file
      const text = await extractTextFromPPTX(tempPPTXFilePath);
      console.log("Extracted text from .pptx:", text);
    }
  } else if (ext === ".pptx") {
    // Call extractTextFromPPTX to extract text directly from the .pptx file
    const text = await extractTextFromPPTX(inputFilePath);
    console.log("Extracted text from .pptx:", text);
  } else {
    console.error("Unsupported file format: ", ext);
  }
}

module.exports = { extractTextFromPPTX, extractTextFromPPT };
