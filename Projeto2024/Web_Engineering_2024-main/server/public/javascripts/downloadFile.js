document.getElementById('downloadBtn').addEventListener('click', function() {
    var recursoId = this.getAttribute('data-recurso-id');
    recursoId = recursoId.replace('#', '%23');
    const fileTitle = this.getAttribute('data-title') + '.zip';
    const url = `http://localhost:15001/download/${recursoId}`;

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
            a.download = fileTitle;  // Use the title as the filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Erro ao descarregar o recurso:', error));
});
