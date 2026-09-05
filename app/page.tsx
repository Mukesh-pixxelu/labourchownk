import Link from "next/link";

export default function Home() {
  return (
    <div className="page">
      <div className="card">
        <h1 className="logo">LabourChowk</h1>
        <p className="sub">Kaam chahiye? Ya labour chahiye? Pehle yeh batao.</p>
        <Link href="/labour" className="btn btn-labour" type="button">
          Main labour hoon
        </Link>
        <Link href="/thekedar" className="btn btn-thekedar" type="button">
          Main thekedar hoon
        </Link>
      </div>
    </div>
  );
}