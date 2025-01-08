interface RemoveUserProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userDisplayName?: string;
  userId?: string;
}

function RemoveUser(props: RemoveUserProps) {
  return (
    <div
      className={`${"modal"} ${props.open ? "display-flex" : "display-none"}`}
    >
      <div className="modal-main">
        <div className="modal-head">
          <h2>Are you sure you want to remove {props.userDisplayName}?</h2>
        </div>
        <div className="modal-body">{/* {props.children} */}</div>
        <div className="btn-container">
          <button type="button" className="btn" onClick={props.onConfirm}>
            Remove User
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              props.onClose();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    // Eventually refactor this return with my own CSS
  );
}

export default RemoveUser;
