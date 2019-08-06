const Payment = require("../models/Payment");

const adminuser = "shopowner";

exports.fundAccount = async function(req, res) {
  const { amount } = req.body;
  if (!amount) {
    res.json({
      status: 400,
      data: {
        message: "You did not enter an amount."
      }
    });
  }

  const balanceFound = await Payment.findOne({ user: adminuser });

  if (balanceFound) {
    const balanceUpdated = await Payment.findOneAndUpdate(
      { user: adminuser },
      { balance: parseInt(balanceFound.balance) + parseInt(amount) }
    );

    if (balanceUpdated) {
      res.json({
        status: 200,
        data: {
          message: "Balance has been added."
        }
      });
    } else {
      res.json({
        status: 400,
        message: "Unable to add to balance"
      });
    }
  }
};

// Retrieve all vendors...
// exports.allVendors = function(req, res) {
//   Vendor.find({ status: "active" }, function(err, vendors) {
//     if (err) {
//       res.json({
//         status: 400,
//         message: "Unable to find vendors"
//       });
//     } else {
//       res.json({ status: 200, data: vendors });
//     }
//   });
// };
