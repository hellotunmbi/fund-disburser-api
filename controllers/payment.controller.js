const Payment = require("../models/Payment");
require("dotenv").config({ path: "variables.env" });
const unirest = require("unirest");

const adminuser = "shopowner";
const PAYSTACK_API = process.env.PAYSTACK_API;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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

  const reference = randomstring.generate(10);
  const email = ADMIN_EMAIL;
  const url = PAYSTACK_API + "/transaction/initialize";
  const options = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BEARER_AUTH}`
    },
    method: "POST",
    body: JSON.stringify({ amount, email, reference })
  };

  try {
    const transactionCallbackRaw = await fetch(url, options);
    const transactionCallback = await transactionCallbackRaw.json();

    res.json({
      status: 200,
      msg: transactionCallback,
      metadata: options,
      url: url
    });
  } catch (err) {
    res.json({
      status: 400,
      msg: err,
      metadata: options,
      url: url
    });
  }

  //   const balanceFound = await Payment.findOne({ user: adminuser });

  //   if (balanceFound) {
  //     const balanceUpdated = await Payment.findOneAndUpdate(
  //       { user: adminuser },
  //       { balance: parseInt(balanceFound.balance) + parseInt(amount) }
  //     );

  //     if (balanceUpdated) {
  //       res.json({
  //         status: 200,
  //         data: {
  //           message: "Balance has been added."
  //         }
  //       });
  //     } else {
  //       res.json({
  //         status: 400,
  //         message: "Unable to add to balance"
  //       });
  //     }
  //   }
};

// Confirm Transaction...
exports.confirmTransaction = async function(req, res) {
  const { ref } = req.params;
  //   if (!ref) {
  //     res.json({
  //       status: 400,
  //       data: {
  //         message: "Invalid Reference."
  //       }
  //     });
  //   }

  const url = PAYSTACK_API + "/transaction/verify/" + ref;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BEARER_AUTH}`
    }
  };

  try {
    const transactionCallbackRaw = await unirest(url, options);
    // const transactionCallback = await transactionCallbackRaw.json();

    // if (transactionCallback.status === true) {
    res.json({
      status: 200,
      msg: transactionCallbackRaw,
      metadata: options,
      url: url
    });
    // }
  } catch (err) {
    res.json({
      status: 400,
      msg: err,
      message: "Error occured",
      metadata: options
      //   url: url
    });
  }
};
