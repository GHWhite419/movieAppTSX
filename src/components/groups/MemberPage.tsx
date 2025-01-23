import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
import MovieList from "../movies/MovieList";
import RemoveUser from "./RemoveUser";
import GroupType from "../../types/GroupType";

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
  const [member, setMember] = useState<GroupType["members"][number] | null>(
    null
  );
  const [userRole, setUserRole] = useState<"admin" | "mod" | "member">(
    "member"
  );
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroupAndMember = async () => {
      try {
        if (groupId) {
          const targetGroup = await getGroup(groupId);
          setGroup(targetGroup);
          const targetMember = targetGroup?.members.find(
            (m) => m.groupUserId === memberId
          );
          if (targetMember) setMember(targetMember);
          else {
            throw new Error("Member not found");
          }
        } else {
          throw new Error("Group not found");
        }
      } catch {
        throw new Error("Error fetching group/member");
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

  // const toggleRemoveModal = (member?: {
  //   groupUserId: string;
  //   groupUserName: string;
  // }) => {
  //   if (member) {
  //     setShowRemoveModal(true);
  //   } else {
  //     setShowRemoveModal(false);
  //   }
  // };

  const toggleRemoveModal = (member?: GroupType["members"][number]) => {
    setShowRemoveModal(Boolean(member));
  };

  const handleConfirmRemove = async () => {
    if (group && member)
      await removeUserFromGroup(group.id, member.groupUserId);
    setShowRemoveModal(false);
    // fetchGroup();
    // Redirect to GroupPage
  };

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
