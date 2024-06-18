// Verifica se o zip tem os ficheiros necessários para o tipo de recurso selecionado
document.getElementById('submitBtn').addEventListener('click', function() {
    // Faz um pedido para o servidor dos ficheiros obrigatórios no zip
    fetch('http://localhost:15001/tiposRecursos/' + document.getElementById('tipo').value + '?json=true')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const mandatoryFiles = data.mandatoryFiles;
        const fileInput = document.getElementById('zip');
        const file = fileInput.files[0];
        
        // Verifica se um ficheiro foi selecionado
        if (file) {
            const zip = new JSZip();
            zip.loadAsync(file)
            .then(zip => {

                const filesInZip = Object.keys(zip.files);
                const missingFiles = mandatoryFiles.filter(file => !filesInZip.includes(file));
                if (missingFiles.length === 0) {
                    // Todos os ficheiros necessários estão no zip, enviar o formulário
                    document.querySelector('form').submit();
                } else {
                    // Alguns ficheiros estão em falta
                    alert(`O zip não contém os seguintes ficheiros obrigatórios: ${missingFiles.join(', ')}`);
                }
            })
            .catch(error => console.error('Erro ao ler o zip:', error));
        } else {
            alert('Selecione um ficheiro zip');
        }
    })
    .catch(error => console.error('Erro ao obter ficheiros obrigatórios:', error));
});
