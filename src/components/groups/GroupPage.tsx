import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
// import { MovieContext, MovieContextType } from "../../context/MovieContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
// import { AuthContext } from "../../firebase/AuthContext";
// import { VotingContext, VotingContextType } from "../../context/VotingContext";
import { GroupType } from "../../types/GroupType";
// import MovieType from "../../types/MovieType";
import InviteToGroup from "./InviteToGroup";
// import RemoveUser from "./RemoveUser";

function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { getGroup, verifyGroupMemberList } = useContext(
    GroupContext
  ) as GroupContextType;
  // const { user } = useContext(AuthContext);
  //   2 type assertions
  const [group, setGroup] = useState<GroupType | null>(null);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

  // const [userRole, setUserRole] = useState<"admin" | "mod" | "member">(
  //   "member"
  // );
  // The userRole state may still be important at this level.

  // const [votes, setVotes] = useState
  // This useState needs to track which movies have been voted on for each list. The ones already voted should be checked, and once a number of movies are checked equal to votesAllowed, the rest of the boxes should be greyed out.

  // Should I reduce the number of declarations I have at the top here? 6-7 useStates, 4 useContexts, and a useParams?

  const toggleInviteModal = () => {
    setShowInviteModal(!showInviteModal);
  };

  const fetchGroup = async () => {
    if (groupId) {
      try {
        const fetchedGroup = await getGroup(groupId);
        setGroup(fetchedGroup);
        // if (fetchedGroup) {
        // const targetMemberMovies: { [userId: string]: MovieType[] } = {};
        // for (const member of fetchedGroup.members) {
        //   const movieList = await getMovieList(member.groupUserId);
        //   targetMemberMovies[member.groupUserId] = movieList;
        // }
        // setMemberMovies(targetMemberMovies);
        // }
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
      verifyGroupMemberList(groupId);
      // Perhaps find another place to call this function later? It's not directly related to fetching the group. Can be something an admin triggers.
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);
  //  May need to call something in this dependency array? idk

  // useEffect(() => {
  //   const fetchUserRole = () => {
  //     if (group && user) {
  //       for (const member of group.members) {
  //         if (member.groupUserId === user.uid) {
  //           setUserRole(member.groupUserRole);
  //           break;
  //         }
  //       }
  //     }
  //   };
  //   fetchUserRole();
  // }, [group]);

  return (
    <>
      <h1>Hello {group?.groupName}! Here are your group members: </h1>
      <ul>
        {group?.members.map(
          (member: {
            groupUserId: string;
            groupUserName: string;
            groupUserRole: "admin" | "mod" | "member";
          }) => (
            <li key={member.groupUserId}>
              <h2>
                <Link to={`members/${member.groupUserId}`}>
                  {member.groupUserName}
                </Link>
              </h2>
            </li>
          )
        )}
      </ul>
      <p>
        Want to add a friend to the group?
        <button type="button" onClick={toggleInviteModal}>
          Invite here.
        </button>
      </p>
      <Link to="/home">Back to your list</Link>
      <InviteToGroup
        open={showInviteModal}
        onClose={toggleInviteModal}
        groupId={groupId ? groupId : "404"}
      />
    </>
  );
}

export default GroupPage;
