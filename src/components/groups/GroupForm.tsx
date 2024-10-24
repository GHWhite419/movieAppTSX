import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { GroupContext, GroupContextType } from "../../context/GroupContext";

function GroupForm() {
  const { createGroup } = useContext(GroupContext) as GroupContextType;
  // Type assertion to remove here.
  const [groupName, setGroupName] = useState<string>("");

  // We may eventually use react-hook-form and yup here. For now I'll leave it because the form is small, and I don't yet see the need to input much information other than 'name'.

  return (
    <>
      <form
        action="submit"
        onSubmit={(e) => {
          e.preventDefault();
          createGroup(groupName);
        }}
      >
        <label htmlFor="name">Group name: </label>
        <input
          type="text"
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        />
        <button type="submit">Create group</button>
      </form>
      <Link to="/">Cancel</Link>
    </>
  );
}

export default GroupForm;
