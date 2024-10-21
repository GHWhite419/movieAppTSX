interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  movieTitle: string;
  movieId: string;
}

function ConfirmDelete(props: ModalProps) {
  return (
    <>
      <div
        className={`${"modal"} ${props.open ? "display-flex" : "display-none"}`}
      >
        <div className="modal-main">
          <div className="modal-head">
            <h2>Are you sure you want to delete {props.movieTitle}?</h2>
          </div>
          <div className="modal-body">{/* {props.children} */}</div>
          <div className="btn-container">
            <button type="button" className="btn" onClick={props.onConfirm}>
              Delete
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                console.log(props.onClose());
                props.onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
    // Eventually refactor this return with my own CSS
  );
}

export default ConfirmDelete;
