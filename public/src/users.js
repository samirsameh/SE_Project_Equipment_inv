$(document).ready(function() {
    console.log("Document ready - users.js loaded");

    // Delete user functionality
    $('#tbody').on('click', '.d-button', function () {
        const userId = $(this).data('user_id'); // Get the user ID from the data attribute
        console.log('Delete button clicked for user ID:', userId);
    
        const button = $(this); // Preserve the context of 'this' for later use
    
        if (confirm('Are you sure you want to delete this user?')) {
            $.ajax({
                type: "DELETE",
                url:`/api/v1/users/${userId}`,
                success : function (data) {
                    console.log(data);
                    alert('User deleted successfully');
                    // Dynamically remove the table row
                    button.closest('tr').fadeOut(300, function () {
                        $(this).remove();
                    });
                },
                error : function (data) {
                    console.log("Error message", data.responseText);
                    alert(data.responseText);
                }
            });
        }
    });
    
    // Update user role functionality
$('#update').on('click', function() {
  const updateEmpArray = [];

  $('#tbody tr').each(function() {
      const userId = $(this).find('.d-button').data('user_id'); // Get the user ID
      const newRole = $(this).find('input[type="text"]').val().trim(); // Get the new role from the input field

      console.log('User ID:', userId, 'New Role:', newRole); // Debugging output

      if (newRole) {
          updateEmpArray.push({ user_id: userId, role: newRole });
      }
      
  });

  if (updateEmpArray.length === 0) {
      alert("You did not update any user roles");
      return;
  }

  console.log('Payload to send:', updateEmpArray); // Debugging output

  $.ajax({
      type: "PUT",
      url: '/api/v1/users/update',
      data: JSON.stringify(updateEmpArray),
      contentType: "application/json",
      success: function(data) {
          console.log(data);
          alert('User roles updated successfully');
          location.reload(); // Reload the page to reflect updates (optional)
      },
      error: function(data) {
          console.log("Error message", data.responseText);
          alert(data.responseText);
      }
  });
});

    });

