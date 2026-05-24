import React, { useContext, useEffect, useState } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from "react-toastify";

const Verify = () => {
    const [searchParams,setSearchParams]=useSearchParams();
    const success=searchParams.get("success");
    const orderId=searchParams.get("orderId");
    const {url} =useContext(StoreContext);
    const navigate= useNavigate();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const verifyPayment=async()=>{
        try {
            const response= await axios.post(url+"/api/order/verify",{success,orderId});
            if(response.data.success){
                setStatus('success');
            }else{
                setStatus('failed');
                setErrorMsg(response.data.message || "Payment not confirmed.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setStatus('failed');
            setErrorMsg("Network or server error occurred.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        verifyPayment();
    },[])

  return (
    <div className='verify'>
        {loading ? (
            <div className="spinner"></div>
        ) : status === 'success' ? (
            <div className="verify-result success">
                <div className="icon-circle">
                    <div className="icon">✓</div>
                </div>
                <h2>Payment Successful!</h2>
                <p>Your order has been placed successfully.</p>
                <button onClick={() => navigate("/myorders")}>View My Orders</button>
            </div>
        ) : (
            <div className="verify-result failed">
                <div className="icon-circle">
                    <div className="icon">✕</div>
                </div>
                <h2>Payment Failed</h2>
                <p>{errorMsg || "Something went wrong with your transaction."}</p>
                <button onClick={() => navigate("/")}>Go to Home</button>
            </div>
        )}
    </div>
  )
}

export default Verify
