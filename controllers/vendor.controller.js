const Vendor = require("../models/Vendor");
const randomstring = require("randomstring");

exports.addVendor = async function(req, res) {
  const {
    customer_name,
    business_name,
    amount,
    acct_name,
    acct_no,
    bank
  } = req.body;

  if (
    !customer_name &&
    !business_name &&
    !acct_name &&
    !amount &&
    !acct_no &&
    !bank
  ) {
    res.json({
      status: 400,
      data: {
        message: "Some fields are not filled. Try Again"
      }
    });
  }

  const vendor = Vendor({
    customer_name,
    business_name,
    amount,
    acct_name,
    acct_no,
    bank,
    status: "active",
    paid: false
  });

  await vendor.save(function(err) {
    if (err) {
      res.json({
        status: 400,
        data: {
          message: "An Error Occured: " + err
        }
      });
    } else {
      res.json({
        status: 200,
        data: {
          message: "Vendor Created Successfully."
        }
      });
    }
  });
};

// Retrieve all vendors...
exports.allVendors = function(req, res) {
  Vendor.find({ status: "active" }, function(err, vendors) {
    if (err) {
      res.json({
        status: 400,
        message: "Unable to find vendors"
      });
    } else {
      res.json({ status: 200, data: vendors });
    }
  });
};
