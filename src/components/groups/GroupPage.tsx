import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { MovieContext, MovieContextType } from "../../context/MovieContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
import GroupType from "../../types/GroupType";
import MovieType from "../../types/MovieType";
import InviteToGroup from "./InviteToGroup";

function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { getMovieList } = useContext(MovieContext) as MovieContextType;
  const { getGroup, verifyGroupMemberList } = useContext(
    GroupContext
  ) as GroupContextType;
  //   2 type assertions
  const [group, setGroup] = useState<GroupType | null>(null);
  const [memberMovies, setMemberMovies] = useState<{
    [userId: string]: MovieType[];
  }>({});
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  // Should I reduce the number of declarations I have at the top here? 3 useStates, 2 useContexts, and a useParams?

  const toggleInviteModal = () => {
    setShowInviteModal(!showInviteModal);
  };

  useEffect(() => {
    const fetchGroup = async () => {
      if (groupId) {
        try {
          const fetchedGroup = await getGroup(groupId);
          setGroup(fetchedGroup);
          if (fetchedGroup) {
            const targetMemberMovies: { [userId: string]: MovieType[] } = {};
            for (const member of fetchedGroup.members) {
              const movieList = await getMovieList(member.groupUserId);
              targetMemberMovies[member.groupUserId] = movieList;
            }
            setMemberMovies(targetMemberMovies);
          }
        } catch (error) {
          console.error("Error fetching movie:", error);
        }
        verifyGroupMemberList(groupId);
        // Perhaps find another place to call this function later? It's not directly related to fetching the group. Can be something an admin triggers.
      }
    };
    fetchGroup();
  }, []);
  //   May need to call something in this dependency array? idk

  return (
    <>
      <h1>Hello {group?.name}! Here are your group members: </h1>
      <ul>
        {group?.members.map(
          (member: {
            groupUserId: string;
            groupUserName: string;
            groupUserRole: "admin" | "mod" | "member";
          }) => (
            <li key={member.groupUserId}>
              <h2>{member.groupUserName}</h2>
              <ul>
                {(memberMovies[member.groupUserId] || []).map((movie) => (
                  <li key={movie.id}>{movie.title}</li>
                ))}
                {/*This display's the user's list. May be conditionally rendered once a user clicks on them.  */}
              </ul>
            </li>
          )
        )}
        {/* Map through getGroup return to display member usernames. */}
      </ul>
      <p>
        Want to add a friend to the group?
        <button type="button" onClick={toggleInviteModal}>
          Invite here.
        </button>
      </p>
      <Link to="/movieList">Back to your list</Link>
      <InviteToGroup
        open={showInviteModal}
        onClose={toggleInviteModal}
        groupId={groupId ? groupId : "404"}
      />
    </>
  );
}

export default GroupPage;
