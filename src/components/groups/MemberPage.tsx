import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
import MovieList from "../movies/MovieList";
import RemoveUser from "./RemoveUser";
import { GroupType, MemberType } from "../../types/GroupType";

function MemberPage() {
  const { groupId, memberId } = useParams<{
    groupId: string;
    memberId: string;
  }>();
  const { user } = useContext(AuthContext);
  const { getGroup, removeUserFromGroup } = useContext(
    GroupContext
  ) as GroupContextType;

  const [group, setGroup] = useState<GroupType | null>(null);
  const [member, setMember] = useState<MemberType | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "mod" | "member">(
    "member"
  );
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("loading");
  const [isMemberRemoved, setIsMemberRemoved] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupAndMember = async () => {
      try {
        if (groupId) {
          const targetGroup = await getGroup(groupId);
          setGroup(targetGroup);
          const targetMember = targetGroup?.members.find(
            (m: MemberType) => m.groupUserId === memberId
          );
          if (targetMember) setMember(targetMember);
          else {
            setStatus("redirecting");
            throw new Error("Member not found");
          }
        } else {
          setStatus("redirecting");
          throw new Error("Group not found");
        }
        setStatus("");
      } catch (error) {
        console.error("Error fetching group/member:", error);
        setStatus("redirecting");
      }
    };
    fetchGroupAndMember();
  }, []);

  useEffect(() => {
    const fetchUserRole = () => {
      if (group && user) {
        for (const member of group.members) {
          if (member.groupUserId === user.uid) {
            setUserRole(member.groupUserRole);
            break;
          }
        }
      }
    };
    fetchUserRole();
  }, [group]);

  useEffect(() => {
    if (status === "redirecting") {
      const timer = setTimeout(() => {
        navigate(-1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (status === "deleteError") {
      const timer = setTimeout(() => {
        setStatus("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const toggleRemoveModal = (member?: MemberType) => {
    setShowRemoveModal(Boolean(member));
  };

  const handleConfirmRemove = async () => {
    try {
      if (group && member) {
        await removeUserFromGroup(group.id, member.groupUserId);
        setMember(null);
        setIsMemberRemoved(true);
        setStatus("redirecting");
      }
    } catch (error) {
      console.error("Error removing user:", error);
      setStatus("removeError");
    } finally {
      setShowRemoveModal(false);
    }

    // Redirect to GroupPage
  };

  if (status === "loading") return <p>Loading...</p>;

  if (!member) {
    if (isMemberRemoved === true)
      return (
        <p>Member removed from {group?.name}. Redirecting to your list...</p>
      );
    else {
      return (
        <p>
          Member not found, please try again later. Redirecting to group page...
        </p>
      );
    }
  }

  return (
    <>
      {member ? (
        <>
          <h1>{member.groupUserName}'s list:</h1>
          <MovieList userId={memberId} context="group" groupId={groupId} />
          {member.groupUserRole !== "admin" &&
          member.groupUserId !== user?.uid &&
          (userRole === "admin" || userRole === "mod") &&
          !(member.groupUserRole === "mod" && userRole === "mod") ? (
            <button type="button" onClick={() => toggleRemoveModal(member)}>
              Remove this user
            </button>
          ) : null}
          <p
            style={
              status === "removeError"
                ? { display: "flex" }
                : { display: "none" }
            }
          >
            Error removing user. Please try again later.
          </p>
          <RemoveUser
            open={showRemoveModal}
            onClose={toggleRemoveModal}
            onConfirm={handleConfirmRemove}
            userId={member?.groupUserId}
            userDisplayName={member?.groupUserName}
          />
        </>
      ) : (
        <h1>Member not found</h1>
      )}

      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}

export default MemberPage;
