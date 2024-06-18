function toggleFilters() {

  var filtersDiv = document.getElementById('filters');
  if (filtersDiv.style.display === 'none') {
    filtersDiv.style.display = 'block';
  } else {
    filtersDiv.style.display = 'none';
  }
}

document.querySelector('.button-submit-filters').addEventListener('click', function() {
  var form = document.querySelector('form');
  var inputs = form.querySelectorAll('input, select');
  inputs.forEach(function(input) {
    if (input.value === '') {
      input.name = '';
    }
  });

  // Verifica se não há nenhum campo preenchido
  var empty = true;
  inputs.forEach(function(input) {
    if (input.value !== '') {
      empty = false;
    }
  });
});
