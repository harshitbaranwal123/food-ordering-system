import crypto from "crypto";
import fs from "fs";
import path from "path";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// ─── PayU Configuration ──────────────────────────────────────────────
const getPayuConfig = () => ({
  key: process.env.PAYU_MERCHANT_KEY,
  salt: process.env.PAYU_MERCHANT_SALT,
  baseUrl: process.env.PAYU_BASE_URL || "https://test.payu.in"
});

// ─── Hash Helpers ────────────────────────────────────────────────────

/**
 * Generate SHA-512 hash for PayU payment request.
 * Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
 */
function generatePayuHash(params) {
  const {
    key, txnid, amount, productinfo, firstname, email,
    udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "",
  } = params;

  const hashString =
    `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|` +
    `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||` +
    `${getPayuConfig().salt}`;

  return crypto.createHash("sha512").update(hashString).digest("hex");
}

/**
 * Verify SHA-512 hash from PayU response callback.
 * Reverse sequence: SALT|status||||||udf5|...|udf1|email|firstname|productinfo|amount|txnid|key
 */
function verifyPayuHash(params) {
  const {
    key, txnid, amount, productinfo, firstname, email, status,
    udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "",
    additionalCharges = "",
  } = params;

  // If PayU adds additional charges, they must be included in the hash
  let hashString;
  const { salt } = getPayuConfig();
  if (additionalCharges) {
    hashString =
      `${additionalCharges}|${salt}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|` +
      `${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashString =
      `${salt}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|` +
      `${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }

  return crypto.createHash("sha512").update(hashString).digest("hex");
}

/**
 * Generate a unique transaction ID using timestamp + random suffix.
 */
function generateTxnId(orderId) {
  return `FD_${orderId}_${Date.now()}`;
}

// ─── Place Order (returns PayU form data to frontend) ────────────────
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // Clear user cart after order creation
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Fetch user details for PayU
    const user = await userModel.findById(req.body.userId);
    const txnid = generateTxnId(newOrder._id);

    // Save txnid to order for later verification
    await orderModel.findByIdAndUpdate(newOrder._id, { transactionId: txnid });

    const firstname = req.body.address.firstName || user.name || "Customer";
    const email = req.body.address.email || user.email || "test@example.com";
    const phone = req.body.address.phone || "9999999999";
    const amount = String(req.body.amount.toFixed(2));
    const productinfo = `Order_${newOrder._id}`;

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const surl = `${backendUrl}/api/order/payu-callback`;
    const furl = `${backendUrl}/api/order/payu-callback`;

    // Generate hash
    const { key: PAYU_KEY, baseUrl: PAYU_BASE_URL } = getPayuConfig();
    const hashParams = {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
    };
    const hash = generatePayuHash(hashParams);

    // Build payment data for frontend form
    const paymentData = {
      action: `${PAYU_BASE_URL}/_payment`,
      params: {
        key: PAYU_KEY,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
        udf1: String(newOrder._id),
        udf2: "",
        udf3: "",
        udf4: "",
        udf5: "",
      },
    };

    // Regenerate hash WITH udf1 included (since we set it above)
    const hashWithUdf = generatePayuHash({
      ...hashParams,
      udf1: String(newOrder._id),
    });
    paymentData.params.hash = hashWithUdf;

    res.json({ success: true, paymentData });
  } catch (error) {
    console.error("placeOrder error:", error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// ─── PayU Callback (POST from PayU to surl/furl) ────────────────────
const payuCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const {
      status, txnid, amount, productinfo, firstname, email, hash,
      udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10,
      additionalCharges, key,
    } = req.body;

    const orderId = udf1; // We stored orderId in udf1

    // Debugging: Log PayU response to a file
    try {
      fs.writeFileSync(path.join(process.cwd(), 'payu_debug.json'), JSON.stringify(req.body, null, 2));
    } catch (err) {
      console.error("Error writing debug file:", err);
    }

    const { key: PAYU_KEY } = getPayuConfig();

    // 1. Verify hash to ensure response is authentic
    const calculatedHash = verifyPayuHash({
      key: key || PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      udf1: udf1 || "",
      udf2: udf2 || "",
      udf3: udf3 || "",
      udf4: udf4 || "",
      udf5: udf5 || "",
      udf6: udf6 || "",
      udf7: udf7 || "",
      udf8: udf8 || "",
      udf9: udf9 || "",
      udf10: udf10 || "",
      additionalCharges: additionalCharges || "",
    });

    if (calculatedHash !== hash) {
      console.error("PayU hash verification FAILED", { calculatedHash, receivedHash: hash });
      return res.redirect(
        `${frontendUrl}/verify?success=false&orderId=${orderId || ""}`
      );
    }

    // 2. Validate amount against the order in DB (prevent tampering)
    if (orderId) {
      const order = await orderModel.findById(orderId);
      if (order) {
        const expectedAmount = order.amount.toFixed(2);
        if (expectedAmount !== parseFloat(amount).toFixed(2)) {
          console.error("PayU amount mismatch!", { expected: expectedAmount, received: amount });
          return res.redirect(`${frontendUrl}/verify?success=false&orderId=${orderId}`);
        }
      }
    }

    // 3. Update order based on payment status
    if (status === "success") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      console.log(`✅ Payment successful for order ${orderId}, txnid: ${txnid}`);
      return res.redirect(`${frontendUrl}/verify?success=true&orderId=${orderId}`);
    } else {
      // Payment failed or cancelled — delete the order
      await orderModel.findByIdAndDelete(orderId);
      console.log(`❌ Payment ${status} for order ${orderId}, txnid: ${txnid}`);
      return res.redirect(`${frontendUrl}/verify?success=false&orderId=${orderId}`);
    }
  } catch (error) {
    console.error("payuCallback error:", error);
    return res.redirect(`${frontendUrl}/verify?success=false&orderId=`);
  }
};

// ─── Verify Order (called by frontend Verify page) ──────────────────
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      const order = await orderModel.findById(orderId);
      if (order && order.payment) {
        res.json({ success: true, message: "Paid" });
      } else {
        res.json({ success: false, message: "Payment not confirmed" });
      }
    } else {
      // Clean up if order still exists
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── User Orders (frontend) ─────────────────────────────────────────
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── List Orders (admin panel) ──────────────────────────────────────
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ─── Update Order Status (admin) ────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    } else {
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, payuCallback, verifyOrder, userOrders, listOrders, updateStatus };
