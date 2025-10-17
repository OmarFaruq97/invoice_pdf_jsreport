const validate = (data) => {
  const errors = [];

  // Example: Check invoice number
  if (!data.invoice_number || data.invoice_number.trim() === "") {
    errors.push("Invoice number is required");
  }
 

  // Example: Check total amount
  if (data.total_amount === undefined || data.total_amount < 0) {
    errors.push("Total amount must be greater than or equal to 0");
  }

  

  return null; // No validation errors
};

module.exports = { validate };
