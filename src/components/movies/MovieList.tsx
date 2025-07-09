import MovieType from "../../types/MovieType";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { MovieContext, MovieContextType } from "../../context/MovieContext";
import { Link } from "react-router-dom";
import useVoting from "../../hooks/useVoting";
import { MemberType } from "../../types/GroupType";
import ViewList from "./lists/ViewList";
import VoteList from "./lists/VoteList";
// import TiebreakList from "./lists/TiebreakList";

interface MovieListProps {
  userId?: string;
  context: "home" | "group";
  groupId?: string;
  votesAllowed?: number;
  groupMembers?: MemberType[];
}

function MovieList({
  userId = "",
  context,
  groupId = "",
  votesAllowed = 0,
  groupMembers = [],
}: MovieListProps) {
  const { user } = useContext(AuthContext);
  const { getMovieList } = useContext(MovieContext) as MovieContextType;
  // GPT recommended I null guard instead of type cast like this. I wonder what devs think is the best practice?

  const {
    votes,
    setVoteConfig,
    selectedMovie,
    subscribeToVotes,
    movieVotesReceived,
    userVotesCast,
    setUserVotesCast,
    voteCount,
    setVoteCount,
    isTieBreakNeeded,
    isVotingDecided,
    // selectWinningMovie,
  } = useVoting();

  const [movies, setMovies] = useState<MovieType[]>([]);

  const [isReadyToSubscribe, setIsReadyToSubscribe] = useState<boolean>(false);

  const [listMode, setListMode] = useState<"view" | "vote" | "tiebreak">(
    "view"
  );

  const groupConditions = {
    isGroupContext: context === "group",
    hasUserId: !!userId,
    hasGroupId: !!groupId,
    hasVotesAllowed: !!votesAllowed,
    hasGroupMembers: !!groupMembers,
  };

  const areGroupConditionsMet = () =>
    Object.values(groupConditions).every(Boolean);

  useEffect(() => {
    if (votes?.selectedMovies && user?.uid) {
      const retrievedVotes = votes.selectedMovies
        .filter((movie) => movie.votedBy.includes(user.uid))
        .map((movie) => movie.movieId);
      setUserVotesCast(retrievedVotes);
      setVoteCount(retrievedVotes.length);
    }
    console.log(votes);
  }, [votes, listMode]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (userId) {
        const movieList = await getMovieList(userId);
        setMovies(movieList);
      }
    };
    fetchMovies();
  }, [userId]);

  useEffect(() => {
    if (areGroupConditionsMet()) {
      const updatedVoteConfig = {
        memberId: userId,
        groupId: groupId,
        votesAllowed: votesAllowed,
        totalVoters: groupMembers.length - 1,
      };
      setVoteConfig(updatedVoteConfig);
      setIsReadyToSubscribe(true);
    }
  }, [userId, groupId]);

  useEffect(() => {
    if (isReadyToSubscribe) {
      subscribeToVotes(userId, groupId);
    }
  }, [isReadyToSubscribe]);

  let listModeRender;

console.log("Votes in MovieList:", votes)
  // useEffect(() => {}, [listMode]);

  if (listMode === "vote") {
    listModeRender = (
      <VoteList
        userId={userId}
        context={context}
        groupId={groupId}
        movies={movies}
        votes={votes}
        votesAllowed={votesAllowed}
        userVotesCast={userVotesCast}
        setUserVotesCast={setUserVotesCast}
        voteCount={voteCount}
        setVoteCount={setVoteCount}
        movieVotesReceived={movieVotesReceived}
        switchToView={() => setListMode("view")}
      />
    );
  }
  // else if (listMode === "tiebreak") {
  //   listModeRender = <TiebreakList movies={movies} context={context} />;
  // }
  else {
    listModeRender = (
      <ViewList
        context={context}
        movies={movies}
        votes={votes}
        movieVotesReceived={movieVotesReceived}
      />
    );
  }

  return (
    <>
      {areGroupConditionsMet() &&
      isVotingDecided(votesAllowed, groupMembers.length - 1) &&
      selectedMovie ? (
        <h2>{selectedMovie} has been selected!</h2>
      ) : null}

      {areGroupConditionsMet() &&
      userId === user?.uid &&
      isTieBreakNeeded(votesAllowed, groupMembers.length - 1) ? (
        <h2>You have a tie, please select a movie to watch.</h2>
      ) : null}

      {listModeRender}

      <Link to="/addmovie">Add a movie</Link>
      {userId && userId !== user?.uid && listMode === "view" ? (
        <button onClick={() => setListMode("vote")}>Cast Votes</button>
      ) : null}

      {areGroupConditionsMet() &&
      userId === user?.uid &&
      isTieBreakNeeded(votesAllowed, groupMembers.length - 1) ? (
        <button onClick={() => setListMode("tiebreak")}>Tiebreak movie</button>
      ) : null}

      {/* I may want to add a conditional message similar to MyGroups. Something like "Add your first movie to the list", or maybe refer to the search bar.*/}
    </>
  );
}

export default MovieList;
