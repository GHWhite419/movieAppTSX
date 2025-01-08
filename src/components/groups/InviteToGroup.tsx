interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

function InviteToGroup(props: InviteModalProps) {
  const inviteLink = `${window.location.origin}/groups/join/${props.groupId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard");
    // I think I'll want to display a custom message in the modal instead of this alert.
  };
  // Are these good practices to use navigator and alert?

  return (
    <div
      className={`${"modal"} ${props.open ? "display-flex" : "display-none"}`}
    >
      <div className="modal-main">
        <h2>Invite to group</h2>
        <p>Share this link with your friends to invite them to the group: </p>
        <input type="text" value={inviteLink} readOnly />
        <button onClick={copyLink}>Copy Link</button>
        {/* Use that little icon that you always see - screen reader can say "Copy Link" */}
        <button onClick={props.onClose}>Close</button>
      </div>
    </div>
    // The div structure here diverges a little from how I set up DeleteMovie. Will have to ensure it's consistent with DeleteMovie later on.
  );
}

export default InviteToGroup;
