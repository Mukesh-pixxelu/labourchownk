"use client";

import { useState } from "react";
import Link from "next/link";

export default function LabourPage(){
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState("phone");
    const [otp, setOtp] = useState("");
    const [done, setDone] = useState(false);

    function sendOtp(){
        if(phone.length !=10){
            setError("10 digit number daalo");
            return;
        }
        setError("");
        setStep("otp");
    }

    function login(){
        if(otp !== "123456"){
            setError("OTP galat. Test OTP: 123456");
            return;
        }
        setError("");
        setDone(true);
    }

    if(done){
        return(
            <div className="page">
                <div className="card">
                    <h1 className="logo">Labour</h1>
                    <p className="sub">Login ho gaya. {phone}</p>
                    <Link href="/labour/home" className="btn btn-labour">
                        Aage badho
                    </Link>
                </div>
            </div>
        );
    }

    return(
        <div className="page">
            <div className="card">
                <h1 className="logo">Labour login</h1>
                {step == "phone" ? (
                    <>
                    <p className="sub">Apna mobile number daalo</p>
                    <input
                        className="field"
                        type="tel"
                        placeholder="10 digit number"
                        value={phone}
                        onChange={(e)=> setPhone(e.target.value)}
                    />
                    {error ? <p className="error">{error}</p> : null}
                    <button className="btn btn-labour" type="button" onClick={sendOtp}>
                        OTP bhejo
                    </button>
                    </>
                ):(
                    <>
                    <p className="sub">{phone} pe OTP daalo</p>
                    <p className="hint">Testing OTP: 123456 (SMS nahi jaayegi)</p>
                    <input className="field" type="tel" placeholder="OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
                    {error ? <p className="error">{error}</p> : null}
                    <button className="btn btn-labour" type="button" onClick={login}>
                        Login
                    </button>
                    </>
                )} 
                
                <Link href="/" className="back">
                     Wapas
                </Link>
            </div>
        </div>
    );
}