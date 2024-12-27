$(document).ready(function () {
    $('#addequipment').on('click', function () {
        // Validate fields
        if ($('#equipment_name').val() === '') {
            alert('Equipment Name is required!');
            return;
        }

        // Create FormData
        let formData = new FormData();
        formData.append('equipment_name', $('#equipment_name').val());
        formData.append('rating', $('#rating').val());
        formData.append('model_number', $('#model_number').val());
        formData.append('quantity', $('#quantity').val());
        formData.append('status', $('#status').val());
        formData.append('location', $('#location').val());
        formData.append('category_id', $('#category_id').val());
        formData.append('supplier_id', $('#supplier_id').val());

        // Append file
        let equipmentImage = $('#file-input')[0].files[0];
        if (equipmentImage) {
            formData.append('equipment_img', equipmentImage);
        }

        // Send AJAX request
        $.ajax({
            url: '/api/v1/equipment/new',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                alert('Equipment added successfully!');
                console.log(response);
            },
            error: function (xhr, status, error) {
                alert('Failed to add equipment. Please try again.');
                console.error('Error:', error);
                console.error('Response:', xhr.responseText);
            }
        });
    });
});
