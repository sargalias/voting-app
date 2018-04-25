const addOptionBtn = document.getElementById('add-option');
const removeOptionBtn = document.getElementById('remove-option');
const originalOption = document.getElementById('options');
const optionsContainer = document.getElementById('options-container');
let minOptionsStr = optionsContainer.getAttribute('data-min-options') || "2";
const minOptions = parseInt(minOptionsStr);

addOptionBtn.addEventListener('click', addOption);
removeOptionBtn.addEventListener('click', removeOption);

// Init remove option button
if (optionsContainer.children.length > minOptions) {
    removeOptionBtn.removeAttribute('disabled');
}

function addOption() {
    let attr = {
        placeholder: originalOption.getAttribute('placeholder'),
        name: originalOption.getAttribute('name'),
        type: originalOption.getAttribute('type'),
        class: originalOption.getAttribute('class'),
    };
    if (originalOption.hasAttribute('required')) {
        attr.required = true;
    }
    let newOption = document.createElement('input');
    for (let key in attr) {
        newOption.setAttribute(key, attr[key]);
    }
    optionsContainer.appendChild(newOption);
    removeOptionBtn.removeAttribute('disabled');
}

function removeOption() {
    if (optionsContainer.children.length > minOptions) {
        optionsContainer.removeChild(optionsContainer.lastElementChild);
    }
    if (optionsContainer.children.length <= minOptions) {
        removeOptionBtn.setAttribute('disabled', true);
    }
}