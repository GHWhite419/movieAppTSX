import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../../firebase/AuthContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";

function JoinGroup() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useContext(AuthContext);
  const { getGroup, addUserToGroup } = useContext(
    GroupContext
  ) as GroupContextType;
  //   Type assertion
  const [groupName, setGroupName] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const fetchGroup = async () => {
      if (groupId) {
        try {
          const fetchedGroup = await getGroup(groupId);
          if (fetchedGroup) {
            setGroupName(fetchedGroup.name);
            let isMember = false;
            if (!user) {
              setStatus("noUser");
              // Will need to redirect to use a login form or something. Either conditionally render on this page or re-use login component.
            } else {
              for (const member of fetchedGroup.members) {
                if (member.groupUserId === user?.uid) {
                  isMember = true;
                  setStatus("memberExists");
                  break;
                }
              }
              if (isMember === false) {
                setStatus("newMember");
                console.log("Member not found!");
                addUserToGroup(groupId, user.uid, "member");
              }
            }
          }
        } catch (error) {
          console.error("Error finding group:", error);
        }
      }
    };
    fetchGroup();
  }, []);

  const statusMessage = () => {
    switch (status) {
      case "noUser":
        return `Log in to join ${groupName}.`;
      // Interesting...it doesn't display the group's name if there's no user logged in.
      case "memberExists":
        return `You're already a member of ${groupName}.`;
      case "newMember":
        return `Welcome to ${groupName}!`;
      // Also doesn't display the group's name if the user isn't already a member. What's that about?
      default:
        return "";
    }
  };

  return (
    <>
      <h1>{statusMessage()}</h1>
      {user ? (
        <Link to={`/groups/${groupId}`}>
          Click here to redirect to {groupName}
        </Link>
      ) : (
        <Link to="/">Back</Link>
      )}
    </>
  );
}

export default JoinGroup;
