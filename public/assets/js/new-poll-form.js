const addOptionBtn = document.getElementById('add-option');
const removeOptionBtn = document.getElementById('remove-option');
const originalOption = document.getElementById('options');
const optionsContainer = document.getElementById('options-container');

addOptionBtn.addEventListener('click', addOption);
removeOptionBtn.addEventListener('click', removeOption);


function addOption() {
    let attr = {
        placeholder: originalOption.getAttribute('placeholder'),
        name: originalOption.getAttribute('name'),
        type: originalOption.getAttribute('type'),
        class: originalOption.getAttribute('class')
    };
    let newOption = document.createElement('input');
    for (let key in attr) {
        newOption.setAttribute(key, attr[key]);
    }
    optionsContainer.appendChild(newOption);
    removeOptionBtn.removeAttribute('disabled');
}

function removeOption() {
    if (optionsContainer.children.length > 1) {
        optionsContainer.removeChild(optionsContainer.lastChild);
    }
    if (optionsContainer.children.length <= 1) {
        removeOptionBtn.setAttribute('disabled', true);
    }
}