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
                            <input class="text-box-eq text-mid" type="text" id="equipment_name" name="equipment_name" value="${item.equipment_name || ''}" required>
                        </div>
                       <div class="form-group">
        <label class="col-sm-2 control-label kanit-light" for="equipment_img">Image:</label>
        <label for="file-input">
            <span>Choose File</span>
            <input type="file" id="file-input" name="equipment_img">
        </label>
    </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light " for="rating">Rating:</label>
                            <input class="text-box-eq text-mid" type="text" id="rating" name="rating" value="${item.rating || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="model_number">Model Number:</label>
                            <input class="text-box-eq text-mid" type="text" id="model_number" name="model_number" value="${item.model_number || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="quantity">Quantity:</label>
                            <input class="text-box-eq text-mid" type="number" id="quantity" name="quantity" value="${item.quantity || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="status">Status:</label>
                            <input class="text-box-eq text-mid" type="text" id="status" name="status" value="${item.status || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="location">Location:</label>
                            <input class="text-box-eq text-mid" type="text" id="location" name="location" value="${item.location || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="category_id">Category ID:</label>
                            <input class="text-box-eq text-mid" type="text" id="category_id" name="category_id" value="${item.category_id || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="col-sm-2 control-label kanit-light" for="supplier_id">Supplier ID:</label>
                            <input class="text-box-eq text-mid" type="text" id="supplier_id" name="supplier_id" value="${item.supplier_id || ''}" required>
                        </div>
                        <button class="btn btn-light border center-button edit-but" type="submit">Submit</button>
                    </form>
                `;

                $("#formContainer").append(formHtml);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error);
                alert("Error fetching data");
            },
        });
    });

    // Handle form submission
    $(document).on("submit", "#dynamicForm", function (event) {
        event.preventDefault(); // Prevent the form from refreshing the page

        const id = $("#ID").val(); // Retrieve the equipment ID from the input field

        // Create a FormData object to handle file upload
        let formData = new FormData(this); // Use 'this' to get the form data

        // Make the PUT request
        $.ajax({
            url: `/api/v1/equipment/${id}`, // API endpoint with the equipment ID
            type: "PUT",
            data: formData,
            processData: false, // Required for FormData
            contentType: false, // Required for FormData
            success: function (response) {
                alert("Equipment updated successfully!");
                console.log("Server Response:", response);
            },
            error: function (xhr, status, error) {
                alert("Error updating equipment. Please try again.");
                console.error("Error:", error);
            }
        });
    });
});
  
  