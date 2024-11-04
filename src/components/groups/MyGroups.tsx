import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
import GroupType from "../../types/GroupType";

function MyGroups() {
  const [isGroupMember, setIsGroupMember] = useState<boolean>(false);
  const { groups, getGroupList } = useContext(GroupContext) as GroupContextType;

  useEffect(() => {
    getGroupList();
    if (groups.length !== 0) {
      setIsGroupMember(true);
    }
  }, []);

  return (
    <>
      <ul>
        {groups.map((group: GroupType) => (
          <li key={group.id}>
            <Link to={`/groups/${group.id}`}>{group.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="creategroup">
        {isGroupMember
          ? "Want to create a new group? Click here!"
          : "Not part of a group? Create one here!"}
      </Link>
    </>
  );
}

export default MyGroups;
