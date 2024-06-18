document.getElementById('login-button').addEventListener('click', function() {
  document.getElementById('loginOverlay').style.display = 'flex';
});

document.getElementById('closeOverlay').addEventListener('click', function() {
  document.getElementById('loginOverlay').style.display = 'none';
});

document.getElementById('confirmLogin').addEventListener('click', function(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('username').value;
  const passwordInput = document.getElementById('password');
  var password = passwordInput.value;

  console.log(passwordInput);

  if (password) {

    const hashedPassword = CryptoJS.SHA256(password).toString();

    const requestBody = JSON.stringify({
      password: hashedPassword
    });
  
    // Fetch the user data from the server
    fetch(`http://localhost:15001/users/password/${usernameInput}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    })
    .then(response => {
      
      // Se receber um 200, a password está correta
      if (response.status === 200) {
        document.getElementById('loginOverlay').style.display = 'none';
        passwordInput.value = hashedPassword;
        document.getElementById('loginForm').submit();
      } else {
        alert('Incorrect username or password');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error logging in');
    });
  }
});

document.getElementById('register-button').addEventListener('click', function() {
  document.getElementById('registerOverlay').style.display = 'flex';
});

document.getElementById('closeRegisterOverlay').addEventListener('click', function() {
  document.getElementById('registerOverlay').style.display = 'none';
});

document.getElementById('confirmRegister').addEventListener('click', function(event) {
  event.preventDefault();

  const username = document.getElementById('username-register').value;

  // Verifica se o utilizador já existe
  fetch(`http://localhost:15001/users/username/${username}`)
  .then(response => {

    // Se a resposta for 404, o utilizador não existe
    if (response.status === 404) {
      document.getElementById('registerOverlay').style.display = 'none';

      const passwordInput = document.getElementById('password-register');
      const confirmPasswordInput = document.getElementById('confirmPassword-register');
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (password === confirmPassword) {

        const hashedPassword = CryptoJS.SHA256(password).toString();
        passwordInput.value = hashedPassword;

        document.getElementById('registerForm').submit();
      } else {
        alert("Passwords do not match. Please try again.");
      }
    } else {
      alert('Username already exists');
    }
  })
  .catch(error => console.error('Error:', error));
});
