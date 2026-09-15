import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | LabourChowk",
};

export default function PrivacyPage() {
  return (
    <div className="page">
      <div className="card legal-card">
        <h1 className="logo">Privacy Policy</h1>
        <p className="sub">Tumhara data kaise use hota hai.</p>
        <p className="hint">
          Login ke liye mobile number save hota hai. Labour profile me photo,
          naam, profession, area aur availability store hoti hai.
        </p>
        <p className="hint">
          Jab labour aaj available hota hai, unka number search results me
          dikhta hai taaki tum call / WhatsApp kar sako.
          Password-style secrets nahi rakhte; abhi test OTP use hota hai.
        </p>
        <Link href="/" className="back">
          Home
        </Link>
      </div>
    </div>
  );
}
