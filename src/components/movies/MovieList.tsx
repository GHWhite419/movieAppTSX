import MovieType from "../../types/MovieType";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { MovieContext, MovieContextType } from "../../context/MovieContext";
import { Link } from "react-router-dom";
import useVoting from "../../hooks/useVoting";
import { MemberType } from "../../types/GroupType";

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
    // voteForMovie,
    // unvoteForMovie,
    updateVotes,
    movieVotesReceived,
    // userVotesCast,
    isTieBreakNeeded,
    isVotingDecided,
  } = useVoting();

  const [movies, setMovies] = useState<MovieType[]>([]);

  const [isReadyToSubscribe, setIsReadyToSubscribe] = useState<boolean>(false);

  const [isVotingMode, setIsVotingMode] = useState<boolean>(false);

  const [userVotesCast, setUserVotesCast] = useState<string[]>([]);
  const [voteCount, setVoteCount] = useState<number>(0);
  // const [userVotesCast, setUserVotesCast] = useState<{
  //   moviesSelected: string[];
  //   voteCount: number;
  // }>({ moviesSelected: [], voteCount: 0 });

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

  useEffect(() => {
    if (votes?.selectedMovies && user?.uid) {
      const retrievedVotes = votes.selectedMovies
        .filter((movie) => movie.votedBy.includes(user.uid))
        .map((movie) => movie.movieId);
      setUserVotesCast(retrievedVotes);
      setVoteCount(retrievedVotes.length);
    }
  }, [votes, isVotingMode]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const movieId = e.target.value;
    console.log("Is checked?", isChecked);
    setUserVotesCast((prevVotes) => {
      if (isChecked) {
        return [...prevVotes, movieId]; // Add the movie ID to the list
      } else {
        return prevVotes.filter((id) => id !== movieId); // Remove the movie ID from the list
      }
    });
    setVoteCount((prevCount) => (isChecked ? prevCount + 1 : prevCount - 1));
    // if (userVotesCast.voteCount) {
    //   isChecked ? voteCount++ : voteCount--;
    // }
  };

  // const handleCheckboxChange = async (
  //   userId: string,
  //   movieId: string,
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   try {
  //     if (!user || !groupId || !userId) {
  //       throw new Error("User or groupId is missing");
  //     }
  //     if (e.target.checked) {
  //       await voteForMovie({
  //         memberId: userId,
  //         voterId: user.uid,
  //         movieId: movieId,
  //         groupId: groupId,
  //       });
  //     } else {
  //       await unvoteForMovie({
  //         memberId: userId,
  //         voterId: user.uid,
  //         movieId: movieId,
  //         groupId: groupId,
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error("Unknown Error voting");
  //     // Modify this message later perhaps
  //   }
  // };

  const handleSubmitVotes = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!user || !groupId || !userId) {
        throw new Error("User or groupId is missing");
      }
      const voteData = new FormData(e.currentTarget);
      const data = voteData.entries();
      let i = 0;
      let voteArray: string[] = [];
      for (const entry of data) {
        i++;
        // const newVote = entry[1].toString();
        // console.log(`Vote #${i}: --`, newVote, "--");
        voteArray.push(entry[1].toString());
      }
      console.log(voteArray);
      console.log(voteArray.length);
      if (voteArray.length > votesAllowed) {
        throw new Error(
          `You can only cast ${votesAllowed} votes. Please try again.`
        );
      } else {
        await updateVotes(userId, user.uid, voteArray, groupId);
        setIsVotingMode(false);
      }
    } catch (error) {
      console.log(error);
      throw new Error("Unknown Error voting");
      // Modify this message later perhaps
    }
  };

  return (
    <>
      {areGroupConditionsMet() &&
      isVotingDecided(votesAllowed, groupMembers.length - 1) &&
      selectedMovie ? (
        <h2>{selectedMovie} has been selected!</h2>
      ) : null}

      {context === "group" && userId !== user?.uid && isVotingMode ? (
        <form onSubmit={(e) => handleSubmitVotes(e)}>
          <h2>
            You have{" "}
            {votesAllowed && userVotesCast
              ? votesAllowed - voteCount
              : votesAllowed}{" "}
            {votesAllowed && userVotesCast && votesAllowed - voteCount === 1
              ? "vote"
              : "votes"}{" "}
            to cast.{" "}
            {/* {votesAllowed && userVotesCast
              ? votesAllowed - userVotesCast
              : votesAllowed}{" "}
            {votesAllowed && userVotesCast && votesAllowed - userVotesCast === 1
              ? "vote"
              : "votes"}{" "}
            to cast.{" "} */}
          </h2>
          <ul>
            {movies?.map((movie: MovieType) => (
              <li key={movie.id}>
                <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                {userId && userId !== user?.uid && isVotingMode ? (
                  <>
                    <input
                      type="checkbox"
                      id={`vote-${movie.id}-${userId}`}
                      name={`vote-${movie.id}-${userId}`}
                      value={movie.id}
                      // defaultChecked={
                      //   votes?.selectedMovies
                      //     ?.find(
                      //       (targetMovie) => targetMovie.movieId === movie.id
                      //     )
                      //     ?.votedBy.includes(user?.uid ?? "") ?? false
                      // }
                      defaultChecked={userVotesCast.includes(movie.id)}
                      // disabled={
                      //   (!votes?.selectedMovies
                      //     ?.find(
                      //       (targetMovie) => targetMovie.movieId === movie.id
                      //     )
                      //     ?.votedBy.includes(user?.uid ?? "") &&
                      //     userVotesCast === votesAllowed) ??
                      //   false
                      // }
                      disabled={
                        voteCount >= votesAllowed &&
                        !userVotesCast.includes(movie.id)
                      }
                      onChange={(e) => handleCheckboxChange(e)}
                    />
                    <label htmlFor={`vote-${movie.id}-${userId}`}>
                      {/* Vote for this movie */}
                      {/* Need to think about how this text will appear. */}
                      {/* Perhaps a hover tooltip; at minimum, an sr-only label */}
                    </label>
                  </>
                ) : null}
                {context === "group" && movieVotesReceived(movie.id) ? (
                  <p>
                    has {movieVotesReceived(movie.id)}{" "}
                    {movieVotesReceived(movie.id) === 1 ? "vote" : "votes"}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          <button type="submit">Submit Votes</button>
          <button type="button" onClick={() => setIsVotingMode(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <ul>
          {/* We have a conditional render here. If there's no data to display in movies (ie null), we should display a message encouraging the user to add/search for their first movie. */}
          {movies?.map((movie: MovieType) => (
            <li key={movie.id}>
              <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
              {areGroupConditionsMet() &&
              user?.uid === userId &&
              movieVotesReceived(movie.id) >= 1 &&
              isTieBreakNeeded(votesAllowed, groupMembers.length - 1) ? (
                // All votes should be in.
                <>
                  <input
                    type="checkbox"
                    id={`tiebreak-${movie.id}-${userId}`}
                    name={`tiebreak-${movie.id}-${userId}`}
                  />
                  <label htmlFor=""></label>
                </>
              ) : null}
              {context === "group" && movieVotesReceived(movie.id) ? (
                <p>
                  has {movieVotesReceived(movie.id)}{" "}
                  {movieVotesReceived(movie.id) === 1 ? "vote" : "votes"}
                </p>
              ) : null}
            </li>
            // Think about what info I want to display in each li. Right now it's title but I'll display:
            // -Run time
            // -Image/poster
            // -Genre??

            // I might also want to change things up so MovieInfo displays as an expanded li instead of re-directing to a new page.
          ))}
        </ul>
      )}

      <Link to="/addmovie">Add a movie</Link>
      {userId && userId !== user?.uid && !isVotingMode ? (
        <button onClick={() => setIsVotingMode(true)}>Cast Votes</button>
      ) : null}

      {/* I may want to add a conditional message similar to MyGroups. Something like "Add your first movie to the list", or maybe refer to the search bar.*/}
    </>
  );
}

export default MovieList;
