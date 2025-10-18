// validations/salesHistoryValidation.js

exports.validate = (data = {}) => {
    const errors = [];
    const mode = (data.action_mode || "").toLowerCase();

    if (!mode) {
        errors.push("action_mode is required");
        return errors;
    }

    // ----- Insert validation -----
    if (mode === "insert") {
        const requiredFields = [
            "product_id",
            "product_name",
            "quantity",
            "price"
        ];

        requiredFields.forEach(field => {
            if (data[field] === undefined || data[field] === null || data[field].toString().trim() === "") {
                errors.push(`${field} is required`);
            }
        });

        // ----- Length validations -----
        if (data.product_name && data.product_name.length > 255) {
            errors.push("product_name cannot exceed 255 characters");
        }
        if (data.payment_method && data.payment_method.length > 50) {
            errors.push("payment_method cannot exceed 50 characters");
        }
    }

    // ----- Update validation -----
    else if (mode === "update") {
        if (data.sale_id === undefined || data.sale_id === null) {
            errors.push("sale_id is required for update");
        }
    }

    // ----- Delete/GetById validation -----
    else if (mode === "delete" || mode === "getbyid") {
        if (data.sale_id === undefined || data.sale_id === null) {
            errors.push("sale_id is required");
        }
    }

    // ----- GetList validation -----
    else if (mode === "getlist") {
        // No required fields for getList in this case
    }

    // ----- Unknown action_mode -----
    else {
        errors.push(`Unknown action_mode: ${mode}`);
    }

    return errors.length > 0 ? errors : null;
};
