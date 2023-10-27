const { ipcRenderer } = require("electron");
const { setFileStructure } = require("../stateManager");

const form = document.getElementById("directoryForm");
const sourceDirectoryInput = document.getElementById("sourceDirectory");
const errorElement = document.getElementById("error");
const outputExtension = document.getElementById("outputExtension");

let isLoading = false;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (isLoading) {
    document.getElementById("submitErr").innerText =
      "Filesystem is still loading. Please wait.";
    return; // Exit the event listener
  }
  clearLogMessages(); // Clear the log messages
  let messages = [];
  console.log(sourceDirectory.value);
  if (sourceDirectoryInput.value === "" || sourceDirectoryInput.value == null) {
    messages.push("Must specify source directory");
    document.querySelector(".openSourceDialog-error").innerHTML =
      "&bull; Must specify source directory";
  }

  if (messages.length > 0) {
    e.preventDefault();
    errorElement.innerText = messages.join(", ");
  } else {
    // Ensure sourceDirectory is a valid directory path
    let validSourceDirectory = sourceDirectory.value;
    validSourceDirectory.trim();
    if (!validSourceDirectory.endsWith("\\")) {
      // Add a slash at the end if it's missing
      validSourceDirectory += "\\";
    }
    // Set the outputName variable based on the selected extension
    const outputPath = validSourceDirectory + "output" + outputExtension.value;
    console.log("outputPath from validation", outputPath);

    const config = {
      sourceDirectoryInput: sourceDirectoryInput.value,
      outputPath,
      ignoreList: selectedItemsList,
      fullPath: fullPath.checked,
    };

    ipcRenderer.send("start-traverse", config);
    document.getElementById("submissionMessage").textContent =
      "Submission successful!";
  }
});

// Move the filesystemDropdown definition outside the event listener
const filesystemDropdown = document.getElementById("filesystem-dropdown");

ipcRenderer.on("selected-directory", (event, data) => {
  const { directory, structure } = data;

  // Use the structure as needed
  setFileStructure(structure);
  setTextBoxValue("sourceDirectory", directory);

  // Call the function here with the latest data
  generateFilesystem(filesystemDropdown, structure);
});

document.getElementById("openSourceDialog").addEventListener("click", () => {
  // Clear the existing filesystem structure
  while (filesystemDropdown.firstChild) {
    filesystemDropdown.removeChild(filesystemDropdown.firstChild);
  }
  selectedItemsList.length = 0; // This will empty the array
  updateSelectedItemsDisplay();
  ipcRenderer.send("open-directory-dialog");
});

function setTextBoxValue(id, value) {
  document.getElementById(id).value = value;
}

function clearLogMessages() {
  const logMessagesElement = document.getElementById("logMessages");
  logMessagesElement.innerHTML = ""; // This clears the content of the container
}

// Define the addLogMessage function
function addLogMessage(message, status) {
  console.log("addLogMessage");
  // Create a new <p> element for the log message
  const logMessageElement = document.createElement("div");

  // Set the text content of the log message
  logMessageElement.textContent = message;

  // Add a class to style the log message based on its status (accepted or rejected)
  logMessageElement.classList.add("log-message", status);

  // Append the log message element to the logMessages container
  const logMessagesElement = document.getElementById("logMessages");
  logMessagesElement.appendChild(logMessageElement);

  // Optionally, scroll to the bottom to show the latest messages
  logMessagesElement.scrollTop = logMessagesElement.scrollHeight;
}

ipcRenderer.on("loading-start", () => {
  showLoading();
  isLoading = true; // Set the flag to true when loading starts
});

ipcRenderer.on("loading-end", () => {
  hideLoading();
  isLoading = false; // Reset the flag when loading ends
});

ipcRenderer.on("message-to-renderer", (event, data) => {
  if (data.type === "log") {
    addLogMessage(data.message, data.status);
  }
});

// Export the addLogMessage function so it can be used in other parts of your renderer process
module.exports = { addLogMessage };
