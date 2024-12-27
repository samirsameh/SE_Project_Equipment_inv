
$(document).ready(function () {
    // Attach the click event listener to the Add Rating button
    $('#div-btn input[type="button"]').click(function () {
      // Get the equipment ID from the button's ID attribute
      const equipmentId = $(this).attr('id');
      // Get the comment and score values from the input fields
      const comment = $('#comment').val();
      const score = $('#score').val();
  
      // Validate inputs
      if (!comment || !score || score < 1 || score > 5) {
        alert('Please enter a valid comment and a score between 1 and 5.');
        return;
      }
  
      // Send data to the API using an AJAX POST request
      $.ajax({
        url: '/api/v1/rating/new', // API endpoint
        type: 'POST', // HTTP method
        contentType: 'application/json', // Data format
        data: JSON.stringify({
          equipment_id: equipmentId,
          score: parseInt(score, 10), // Convert score to integer
          comment: comment
        }),
        success: function (response) {
          // Handle success
          alert('Rating added successfully!');
          location.reload(); // Reload the page to reflect the new rating
        },
        error: function (xhr) {
          // Handle error
          alert(xhr.responseJSON.message || 'An error occurred while adding the rating.');
        }
      });
    });
  });
  