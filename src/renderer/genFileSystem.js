const loadingContainer = document.getElementById("loadingContainer");

const selectedItemsList = [];

function clearChildCheckboxes(folderId) {
  // Use the folder's unique ID to get the child <ul> element
  const childUL = document.querySelector(`#${folderId} > ul`);

  if (childUL) {
    const childCheckboxes = childUL.querySelectorAll("input[type='checkbox']");
    childCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkbox.checked = false;
        const index = selectedItemsList.indexOf(
          checkbox.nextSibling.textContent
        );
        if (index > -1) {
          selectedItemsList.splice(index, 1);
        }
      }
    });
  }
}

function handleSelectAllCheckboxChange(event) {
    // If the "select all" checkbox is unchecked, do nothing and return
    if (!event.target.checked) {
        return;
    }

    const childUL = document.querySelector(`#filesystem-root`);

    if (childUL) {
        Array.from(childUL.children).forEach(childLi => {
            const checkbox = childLi.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                const itemName = checkbox.nextSibling.textContent;
                if (!selectedItemsList.includes(itemName)) {
                    selectedItemsList.push(itemName);
                }
            }
        });
    }
    updateSelectedItemsDisplay();
}

function createSelectAllCheckbox() {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "select-all-checkbox";
    checkbox.onchange = handleSelectAllCheckboxChange;
    return checkbox;
}

function generateIdFromPath(path) {
  return path.replace(/\//g, "-").replace(/^\./, "dot-"); // Replace leading dot with "dot-"
}

function updateSelectedItemsDisplay() {
  document.getElementById(
    "selected-items"
  ).textContent = `Selected items: ${selectedItemsList.join(", ")}`;
}

function handleFileCheckboxChange(checkbox, fileName) {
  if (checkbox.checked) {
    selectedItemsList.push(fileName);
  } else {
    const index = selectedItemsList.indexOf(fileName);
    if (index > -1) {
      selectedItemsList.splice(index, 1);
    }
    document.getElementById("select-all-checkbox").checked = false;
  }
  updateSelectedItemsDisplay();
}

function handleFolderCheckboxChange(checkbox, folderName, li) {
  if (checkbox.checked) {
    selectedItemsList.push(folderName);
    li.classList.add("collapsed"); // Collapse the folder
    clearChildCheckboxes(li.id); // Clear child checkboxes using the folder's unique ID
  } else {
    const index = selectedItemsList.indexOf(folderName);
    if (index > -1) {
      selectedItemsList.splice(index, 1);
    }
    document.getElementById("select-all-checkbox").checked = false;
  }
  updateSelectedItemsDisplay();
}

function createFileItem(file, path) {
  const li = document.createElement("li");
  li.classList.add("file");
  li.textContent = file;
  li.id = generateIdFromPath(path + file);

  const checkbox = createCheckbox(file);
  li.prepend(checkbox);

  return li;
}

function createFolderItem(folderName, path) {
  const li = document.createElement("li");
  li.classList.add("folder", "collapsed");
  li.id = generateIdFromPath(path + folderName + "/");

  const span = createFolderSpan(folderName);
  li.appendChild(span);

  const checkbox = createCheckbox(folderName, li);
  li.prepend(checkbox);

  return li;
}

function createCheckbox(itemName, folderLi = null) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  if (folderLi) {
    checkbox.onchange = () =>
      handleFolderCheckboxChange(checkbox, itemName, folderLi);
  } else {
    checkbox.onchange = () => handleFileCheckboxChange(checkbox, itemName);
  }
  return checkbox;
}

function createFolderSpan(folderName) {
  const span = document.createElement("span");

  // Folder name
  const nameSpan = document.createElement("span");
  nameSpan.textContent = folderName;
  nameSpan.style.marginRight = "5px"; // Some spacing between the folder name and the icon
  span.appendChild(nameSpan);

  // Create the icon element
  const iconElem = document.createElement("i");
  iconElem.classList.add("fas", "fa-chevron-right"); // Default (collapsed) icon
  span.appendChild(iconElem);

  span.onclick = function () {
    const parentLi = this.parentElement;
    const checkbox = parentLi.querySelector("input[type='checkbox']");
    if (!checkbox.checked) {
      parentLi.classList.toggle("collapsed");

      // Toggle the icon based on collapsed status
      if (parentLi.classList.contains("collapsed")) {
        iconElem.classList.remove("fa-chevron-down");
        iconElem.classList.add("fa-chevron-right");
      } else {
        iconElem.classList.remove("fa-chevron-right");
        iconElem.classList.add("fa-chevron-down");
      }
    }
  };
  return span;
}

function generateFilesystem(node, structure, path = "") {
    const ul = document.createElement("ul");
    if (!path) { // Only for the root level
        ul.id = "filesystem-root";
    }

    // Add the "Select All" checkbox to the main node only at the top level
    if (!path) {
        const selectAllCheckbox = createSelectAllCheckbox();
        const label = document.createElement('label');
        label.htmlFor = "select-all-checkbox";
        label.textContent = "Select All";

        const containerDiv = document.createElement('div'); // Create a container div
        containerDiv.appendChild(selectAllCheckbox);
        containerDiv.appendChild(label);

        node.appendChild(containerDiv); // Append the container div to the node
    }

    // Add files
    structure.files.forEach(file => {
        const fileItem = createFileItem(file, path);
        ul.appendChild(fileItem);
    });

    // Add folders
    for (let folderName in structure.folders) {
        const folderItem = createFolderItem(folderName, path);
        ul.appendChild(folderItem);

        const childFolder = generateFilesystem(folderItem, structure.folders[folderName], path + folderName + '/');
        folderItem.appendChild(childFolder);
    }

    node.appendChild(ul);
    return ul;
}

// Function to show loading icon
function showLoading() {
  loadingContainer.style.display = "block";
}

// Function to hide loading icon
function hideLoading() {
  loadingContainer.style.display = "none";
}
