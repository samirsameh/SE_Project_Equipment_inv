$(document).ready(function () {
    $("#searchbutton").click(function () {
        const id = $("#ID").val();
        $("#formContainer").empty();

        $.ajax({
            type: "GET",
            url: `/api/v1/equipment/${id}`,
            success: function (response) {
                if (!response.equipment) {
                    alert("No result found");
                    return;
                }

                const item = response.equipment;

                // Build the form dynamically
                let formHtml = `
                    <form id="dynamicForm" class="form-container poppins-regular form-horizontal" enctype="multipart/form-data">
                      
                    <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="equipment_name">Current Image:</label>
                           <img src="${item.equipment_img || '/path/to/default/image.jpg'}" class="card-img-top img-minimized img-responsive" alt="${item.equipment_name}"
                        </div>
                    <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="equipment_name">Equipment Name:</label>
                            <input class="text-box-eq text-mid form-control" type="text" id="equipment_name" name="equipment_name" value="${item.equipment_name || ''}" placeholder="Disabled input" disabled>
                        </div>
                
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light " for="rating">Rating:</label>
                            <input class="text-box-eq text-mid form-control" type="text" id="rating" name="rating" value="${item.rating || ''}" placeholder="Disabled input" disabled>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="model_number">Model Number:</label>
                            <input class="text-box-eq text-mid form-control" type="text" id="model_number" name="model_number" value="${item.model_number || ''}" placeholder="Disabled input" disabled>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="quantity">Quantity:</label>
                            <input class="text-box-eq text-mid form-control" type="number" id="quantity" name="quantity" value="${item.quantity || ''}" placeholder="Disabled input" disabled>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="status">Status:</label>
                            <input class="text-box-eq text-mid form-control" type="text" id="status" name="status" value="${item.status || ''}" placeholder="Disabled input" disabled>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="location">Location:</label>
                            <input class="text-box-eq text-mid form-control" type="text" id="location" name="location" value="${item.location || ''}" placeholder="Disabled input" disabled>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="category_id">Category ID:</label>
                            <input class="text-box-eq text-mid form-control" type="text" id="category_id" name="category_id" value="${item.category_id || ''}" placeholder="Disabled input" disabled>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="supplier_id">Supplier ID:</label>
                            <input class="text-box-eq text-mid form-control" type="text" id="supplier_id" name="supplier_id" value="${item.supplier_id || ''}" placeholder="Disabled input" disabled>
                        </div> 
                        <button class="btn btn-light border center-button edit-but" type="submit">Confirm Deletetion</button>
                    </form>
                `;

                $("#formContainer").append(formHtml);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error);
                alert("equipment doesn't exist");
            },
        });

});
  
$(document).on("submit", "#dynamicForm", function (event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    const id = $("#ID").val(); // Retrieve the equipment ID from the input field

    // Create a FormData object to handle file upload
    let formData = new FormData(this); // Use 'this' to get the form data

    // Make the PUT request
    $.ajax({
        url: `/api/v1/equipment/${id}`, // API endpoint with the equipment ID
        type: "DELETE",
        data: formData,
        processData: false, // Required for FormData
        contentType: false, // Required for FormData
        success: function (response) {
            alert("Equipment deleted successfully!");
            console.log("Server Response:", response);
            location.reload(); 
        },
        error: function (xhr, status, error) {
            alert("Error deleteting equipment. Please try again.");
            console.error("Error:", error);
        }
    });
});
});
