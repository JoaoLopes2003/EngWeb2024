document.getElementById('downloadBtn').addEventListener('click', function() {
    const url = `http://localhost:15001/downloadDataBase`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'database.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error('Erro ao descarregar o recurso:', error));
});

document.getElementById('uploadBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('zip');
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const zip = new JSZip(); // Use JSZip instead of AdmZip
        zip.loadAsync(event.target.result).then(function(contents) {
            let foundJson = false;
            let validZip = true;

            contents.forEach((relativePath, file) => {
                if (relativePath === 'dados.json') {
                    foundJson = true;
                } else if (!relativePath.endsWith('.zip')) {
                    validZip = false;
                }
            });

            if (!foundJson || !validZip) {
                alert('The zip file must contain a dados.json file and only other zip files.');
            } else {
                document.getElementById('form').submit();
            }
        });
    };

    reader.onerror = function() {
        alert('Error reading the file.');
    };

    reader.readAsArrayBuffer(file);
});