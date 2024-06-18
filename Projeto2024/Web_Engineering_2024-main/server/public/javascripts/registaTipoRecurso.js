// Adiciona um event listener para cada um dos li's já existentes
document.querySelectorAll('.button-edit-tipo-files').forEach(function(button) {
    button.addEventListener('click', function() {
        removeFile(button);
    });
});

document.getElementById('addFileBtn').addEventListener('click', function() {
    const ul = document.getElementById('mandatoryFilesList');
    const li = document.createElement('li');
    li.className = 'mandatory-file';
    
    const input = document.createElement('input');
    input.className = 'select-option-box';
    input.type = 'text';
    input.name = 'mandatoryFiles[]';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'button-edit-tipo-files';
    removeBtn.innerText = 'Remover';
    removeBtn.addEventListener('click', function() {
        ul.removeChild(li);
    });

    li.appendChild(input);
    li.appendChild(removeBtn);

    ul.appendChild(li);
});

function removeFile(button) {
    const li = button.parentElement;
    li.parentElement.removeChild(li);
}

// Verifica se o nome do tipo de recurso já existe
document.getElementById('submitBtn').addEventListener('click', function() {

    fetch('http://localhost:15001/tiposRecursos')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        const tiposRecursos = data.map(tipo => tipo._id);
        const tipo = document.getElementById('nome').value;

        if (tiposRecursos.includes(tipo)) {
            alert('O tipo de recurso já existe');
        } else {
            document.getElementById('form').submit();
        }
    })
    .catch(error => console.error(error));
});
