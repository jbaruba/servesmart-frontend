export default function HeaderBar({ adminName="Jean Bonsink", onLogout=()=>{} }){
  return (
    <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
      <div className="fs-3">Name: {adminName}</div>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary">🔔 Notification</button>
        <button className="btn btn-outline-secondary" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}
