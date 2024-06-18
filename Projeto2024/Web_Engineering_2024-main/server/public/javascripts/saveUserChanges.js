document.getElementById('subBtn').addEventListener('click', function() {
    var novaPassword = document.getElementById('password-nova').value;
    var confirmacaoNovaPassword = document.getElementById('password-nova-confirmacao').value;
    if (novaPassword != confirmacaoNovaPassword) {
        alert('As passwords não coincidem!');
    } else {
        var novaPasswordiInput = document.getElementById('password-nova');
        var confirmacaoNovaPasswordInput = document.getElementById('password-nova-confirmacao');
        var novaPasswordHashed = CryptoJS.SHA256(novaPassword).toString();
        novaPasswordiInput.value = novaPasswordHashed;
        confirmacaoNovaPasswordInput.value = novaPasswordHashed;

        document.querySelector('form').submit();
    }
});
