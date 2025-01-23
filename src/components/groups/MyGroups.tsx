import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
import { AuthContext } from "../../context/AuthContext";
import GroupType from "../../types/GroupType";

function MyGroups() {
  const [isGroupMember, setIsGroupMember] = useState<boolean>(false);
  const { groups, getGroupList, verifyUserGroupList } = useContext(
    GroupContext
  ) as GroupContextType;
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      getGroupList(user.uid);
      verifyUserGroupList(user.uid);
    }
    if (groups.length !== 0) {
      setIsGroupMember(true);
    }
  }, []);

  return (
    <>
      <ul>
        {groups.map((group: Omit<GroupType, "members">) => (
          <li key={group.id}>
            <Link to={`/groups/${group.id}`}>{group.name}</Link>
          </li>
        ))}
        {/* Damnit */}
      </ul>
      <Link to="/creategroup">
        {isGroupMember
          ? "Want to create a new group? Click here!"
          : "Not part of a group? Create one here!"}
      </Link>
      {/* Refactor this somehow to only highlight the "Click/Create here" as a link, the rest should be a paragraph */}
    </>
  );
}

export default MyGroups;
