import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | LabourChowk",
};

export default function TermsPage() {
  return (
    <div className="page">
      <div className="card legal-card">
        <h1 className="logo">Terms &amp; Conditions</h1>
        <p className="sub">LabourChowk use karne se pehle yeh padh lo.</p>
        <p className="hint">
          LabourChowk ghar wale ko aaj available labour se milata hai. Hum kaam
          ki guarantee nahi dete. Call, WhatsApp aur hiring user ki zimmedari
          hai.
        </p>
        <p className="hint">
          Galat OTP, fake profile, ya doosre ka number use karna mana hai. Hum
          account band kar sakte hain.
        </p>
        <Link href="/" className="back">
          Home
        </Link>
      </div>
    </div>
  );
}
