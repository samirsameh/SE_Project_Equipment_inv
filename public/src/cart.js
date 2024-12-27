$(document).ready(function () {
    // Handle the Update button click
    $('#update').on('click', function () {
        const updates = [];

        // Gather updated quantities and cart IDs from the input fields
        $('#tbody tr').each(function () {
            const cartId = $(this).find('.cart-id').text(); // Get the cart ID from the hidden td
            const equipmentId = $(this).find('input[name="quantity"]').attr('id'); // Get the equipment ID
            const quantity = $(this).find('input[name="quantity"]').val(); // Get the updated quantity

            if (equipmentId && quantity) {
                updates.push({ cartId: cartId, equipmentId: equipmentId, quantity: quantity });
            }
        });

        // Make the AJAX request to update the cart
        $.ajax({
            type: "PUT",
            url: '/api/v1/cart/update', // Ensure this endpoint exists
            contentType: 'application/json',
            data: JSON.stringify(updates),
            success: function (response) {
                alert('Cart updated successfully!');
                console.log("Server Response:", response);
                location.reload(); // Optionally reload the page to reflect updates
            },
            error: function (xhr, status, error) {
                console.error("Error updating cart:", error);
                alert('Failed to update cart. Error: ' + xhr.responseText);
            }
        });
    });

    // Handle the Make Order button click
    $('#makeOrder').on('click', function () {
        // Make the AJAX request to create an order
        $.ajax({
            type: "POST",
            url: '/api/v1/order/new', // Ensure this endpoint exists
            contentType: 'application/json',
            success: function (response) {
                alert('Order created successfully!');
                console.log("Server Response:", response);
                location.reload(); // Optionally reload the page to reflect updates
            },
            error: function (xhr, status, error) {
                console.error("Error creating order:", error);
                alert('Failed to create order. Error: ' + xhr.responseText);
            }
        });
    });

    // Handle the Delete button click
    $(document).on('click', '.remove-from-cart', function () {
        const cartId = $(this).data('cart-id'); // Get the cart ID from the button's data attribute

        // Make the AJAX request to delete the cart item
        $.ajax({
            type: "DELETE",
            url: `/api/v1/cart/delete/${cartId}`, // API endpoint with the cart ID
            success: function (response) {
                alert('Item removed from cart successfully!');
                console.log("Server Response:", response);
                location.reload(); // Optionally reload the page to reflect updates
            },
            error: function (xhr, status, error) {
                console.error("Error deleting cart item:", error);
                alert('Failed to remove item from cart. Error: ' + xhr.responseText);
            }
        });
    });
});
