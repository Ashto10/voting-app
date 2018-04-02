'use strict';

(function () {
  
  var option = $('<div>').attr('class', 'option');
  $('<label>').text('Choice name:').appendTo(option);
  $('<input>').attr({ type: 'text', name: 'options[]', placeholder: 'name' }).appendTo(option);
  $('<a>').attr({class: 'option-remove btn btn-sm danger' }).text('X').appendTo(option);
  
  ajaxFunctions.ready( function() {
    var count = 0;
    do {
      count++;
      option.clone().appendTo($('#options-container'));
    } while (count < 3)
  });

  $('#add-option').on('click', function () {
    if ($('.option-remove').length < 10) {
      $('.option-remove').removeClass('disabled');
      option.clone().appendTo($('#options-container'));
      if ($('.option-remove').length === 10) {
         $(this).addClass('disabled');
      }
    }
  });
  
  $(document).on('click', '.option-remove', function() {
    if ($('.option-remove').length > 2) {
      $('#add-option').removeClass('disabled');
      $(this).parent().remove();
      
      if ($('.option-remove').length === 2) {
        $('.option-remove').addClass('disabled');
      }
    }
  });
})();

function checkForm() {
  var error = false;
  $('.error').text('');
  
  var pollName = $('#pollName').val();
  if (pollName === '') {
    $('.pollName .error').text('Name cannot be empty');
    error = true;
  }
  
  var options = [];
  $('.option input').each(function(){
    var option = $(this).val();
    if (option !== '') { 
      options.push(option);
    }
  });
  
  if (options.length <= 1) {
    $('.options .error').text('There must be at least two options');
    error = true
  }
  
  if (error) {
    return false;
  }
  
  return true;
}