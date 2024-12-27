$(document).ready(function() {
    console.log("Document ready - search.js loaded");

    $("#searchbutton").click(function() {
        console.log("Search button clicked");

        const category = $('#category').val().trim();
        const supplier = $('#supplier').val().trim();

        const queryParams = {};
        if (category) queryParams.category_name = category;
        if (supplier) queryParams.supplier_name = supplier;

        if (!category && !supplier) {
            alert('Please provide at least a Category or Supplier');
            return;
        }

        // Clear results container to avoid duplicates
        $('#tbody').empty();
        $('#thead').empty();
        $('#equipmentGrid').empty(); // Ensure this is cleared before appending results

        $.ajax({
            type: "GET",
            url: '/api/v1/equipment/view',
            data: queryParams,
            success: function(response) {
                if (!response || !response.equipment || response.equipment.length === 0) {
                    alert('No equipment found');
                    return;
                }

                response.equipment.forEach(row => {
                    $('#equipmentGrid').append(`
                        <div class="col-md-4">
                            <div class="card grid-item card-background">
                                <img src="${row.equipment_img || '/path/to/default/image.jpg'}" class="card-img-top img-responsive" alt="${row.equipment_name}">
                                <div class="card-body">
                                    <h5 class="card-title">${row.equipment_name || ''}</h5>
                                    <p class="card-text">Rating: ${row.rating || ''}</p>
                                    <p class="card-text">Model Number: ${row.model_number || ''}</p>
                                    <p class="card-text">Quantity: ${row.quantity || ''}</p>
                                    <p class="card-text">Status: ${row.status || ''}</p>
                                    <p class="card-text">Location: ${row.location || ''}</p>
                                    <button class="add-to-cart-btn btn btn-light box-but border" data-equipment-id="${row.equipment_id}">Add To Cart</button>
                                    <button class="view-rating-btn btn btn-light box-but border" data-equipment-id="${row.equipment_id}">View or Add Review</button>
                                </div>
                            </div>
                        </div>
                    `);
                });
            },
            error: function(xhr, status, error) {
                console.error("Error in search:", error);
                console.error("Response Text:", xhr.responseText);
                alert('Error occurred while searching for equipment.');
            }
        });
    });

    $("#edit").click(function() {
        window.location.href = "/editequipments";
    });

    $("#add").click(function() {
        window.location.href = "/addequipments";
    });

    $("#delete").click(function() {
        window.location.href = "/deleteequipments";
    });
});



$(document).on('click', '.add-to-cart-btn', function() {
    const equipmentId = parseInt($(this).data('equipment-id'), 10);
    const quantity = 1; // Adjust as necessary

    // Log the data to be sent
    console.log("Sending to server:", { equipmentId, quantity });

    $.ajax({
        type: "POST",
        url: '/api/v1/cart/new',
        contentType: 'application/json',
        data: JSON.stringify({ equipmentId: equipmentId, quantity: quantity }),
        success: function(response) {
            console.log("Success:", response);
            alert('Equipment added to cart successfully!');
        },
        error: function(xhr, status, error) {
            console.error("Error adding to cart:", error);
            console.error("Response status:", xhr.status);
            console.error("Response text:", xhr.responseText);
            alert('Failed to add equipment to cart. Error: ' + xhr.responseText);
        }
    });
});


$(document).on('click', '.view-rating-btn', function() {
    const equipmentId = parseInt($(this).data('equipment-id'), 10);
    console.log("Navigating to /rating with equipmentId:", equipmentId);

    // Redirect to the /rating page with the equipmentId as a query parameter
    window.location.href = `/rating?equipmentId=${equipmentId}`;
});
