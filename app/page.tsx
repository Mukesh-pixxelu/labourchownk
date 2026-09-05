export default function Home() {
  return (
    <div className="page">
      <div className="card">
        <h1 className="logo">LabourChowk</h1>
        <p className="sub">Kaam chahiye? Ya labour chahiye? Pehle yeh batao.</p>
        <button className="btn btn-labour" type="button">
          Main labour hoon
        </button>
        <button className="btn btn-thekedar" type="button">
          Main thekedar hoon
        </button>
      </div>
    </div>
  );
}