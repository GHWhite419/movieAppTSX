import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../firebase/AuthContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";

function JoinGroup() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user, setJoinGroupIntent } = useContext(AuthContext);
  const { getGroup, addUserToGroup } = useContext(
    GroupContext
  ) as GroupContextType;
  //   Type assertion
  const [groupName, setGroupName] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      if (groupId) {
        try {
          const fetchedGroup = await getGroup(groupId);
          if (fetchedGroup) {
            setGroupName(fetchedGroup.name);
            let isMember = false;
            if (!user) {
              setJoinGroupIntent(groupId);
              navigate("/");
              // setStatus("noUser");
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
          setStatus("noGroup");
        }
      }
    };
    fetchGroup();
  }, []);

  const statusMessage = () => {
    switch (status) {
      // case "noUser":
      //   return `Log in to join ${groupName}.`;
      case "memberExists":
        return `You're already a member of ${groupName}.`;
      case "newMember":
        return `Welcome to ${groupName}!`;
      case "noGroup":
        return `${groupName} not found.`;
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
        <>
          <h1>Redirecting...</h1>
          {/* <Login /> */}
          {/* <Link to="/">Log in here</Link> */}
        </>
      )}
    </>
  );
}

export default JoinGroup;
