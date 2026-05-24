import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "/api/order/userorders",
      {},
      { headers: { token } }
    );
    if (response.data.success) {
      setData(response.data.data);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const downloadInvoice = (order) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(255, 99, 71); // Tomato color
      doc.text("INVOICE", 14, 22);

      // Order Details
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(`Order ID: ${order._id}`, 14, 32);
      doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 14, 40);
      doc.text(`Status: ${order.status}`, 14, 48);

      // Billing Address
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Billed To:", 14, 60);
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);

      if (order.address) {
        doc.text(`${order.address.firstName || ""} ${order.address.lastName || ""}`, 14, 68);
        doc.text(`${order.address.street || ""}, ${order.address.city || ""}, ${order.address.state || ""} ${order.address.zipcode || ""}`, 14, 74);
        doc.text(`${order.address.country || ""}`, 14, 80);
        doc.text(`Phone: ${order.address.phone || ""}`, 14, 86);
      } else {
        doc.text(`Customer`, 14, 68);
      }

      // Items Table
      const tableColumn = ["Item Name", "Price", "Quantity", "Total"];
      const tableRows = [];

      if (order.items) {
        order.items.forEach(item => {
          const itemData = [
            item.name,
            `Rs. ${item.price}`,
            item.quantity,
            `Rs. ${item.price * item.quantity}`
          ];
          tableRows.push(itemData);
        });
      }

      autoTable(doc, {
        startY: 95,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [255, 99, 71] }, // Tomato header
        margin: { top: 20 }
      });

      // Total Amount
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 100;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Delivery Fee: Rs. 2`, 140, finalY + 10);
      doc.text(`Total Amount: Rs. ${order.amount}`, 140, finalY + 18);

      doc.save(`invoice_${order._id}.pdf`);
    } catch (err) {
      console.error("Error generating invoice:", err);
      alert("Failed to generate invoice. Check console for details.");
    }
  };
  return (
    <div className="my-orders">
      <h2>Orders</h2>
      <div className="container">
        {data.map((order, index) => {
          return (
            <div key={index} className="my-orders-order">
              <img src={assets.parcel_icon} alt="" />
              <p>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " X " + item.quantity;
                  } else {
                    return item.name + " X " + item.quantity + ",";
                  }
                })}
              </p>
              <p>₹{order.amount}.00</p>
              <p>items: {order.items.length}</p>
              <p>
                <span>&#x25cf;</span>
                <b> {order.status}</b>
              </p>
              <div className="my-orders-btns">
                <button onClick={() => {
                  fetchOrders();
                  setTrackingOrder(order);
                }}>Track Order</button>
                <button className="invoice-btn" onClick={() => downloadInvoice(order)}>Invoice</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Modal Popup */}
      {trackingOrder && (
        <div className="tracking-modal-overlay" onClick={() => setTrackingOrder(null)}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-header">
              <h3>Track Your Order</h3>
              <button className="close-btn" onClick={() => setTrackingOrder(null)}>&times;</button>
            </div>

            <div className="tracking-status">
              <div className="status-indicator">
                <span className="pulse-dot"></span>
                <p>Status: <b>{trackingOrder.status}</b></p>
              </div>
              <p className="delivery-address">
                Delivering to: {trackingOrder.address.street}, {trackingOrder.address.city}
              </p>
            </div>

            <div className="tracking-footer">
              <p>The map shows your delivery destination.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
