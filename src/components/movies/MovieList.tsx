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
    subscribeToVotes,
    voteForMovie,
    unvoteForMovie,
    movieVotesReceived,
    userVotesCast,
    isTieBreakNeeded,
    isVotingDecided,
  } = useVoting();

  const [movies, setMovies] = useState<MovieType[]>([]);

  const [isReadyToSubscribe, setIsReadyToSubscribe] = useState<boolean>(false);

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

  const handleCheckboxChange = async (
    userId: string,
    movieId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!user || !groupId || !userId) {
        throw new Error("User or groupId is missing");
      }
      if (e.target.checked) {
        await voteForMovie({
          memberId: userId,
          voterId: user.uid,
          movieId: movieId,
          groupId: groupId,
        });
      } else {
        await unvoteForMovie({
          memberId: userId,
          voterId: user.uid,
          movieId: movieId,
          groupId: groupId,
        });
      }
    } catch (error) {
      console.log(error);
      throw new Error("Unknown Error voting");
      // Modify this message later perhaps
    }
  };

  return (
    <>
      {context === "group" && userId !== user?.uid ? (
        <h2>
          You have{" "}
          {votesAllowed && userVotesCast
            ? votesAllowed - userVotesCast
            : votesAllowed}{" "}
          {votesAllowed && userVotesCast && votesAllowed - userVotesCast === 1
            ? "vote"
            : "votes"}{" "}
          to cast.{" "}
        </h2>
      ) : null}
      <ul>
        {/* We have a conditional render here. If there's no data to display in movies (ie null), we should display a message encouraging the user to add/search for their first movie. */}
        {movies?.map((movie: MovieType) => (
          <li key={movie.id}>
            <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
            {userId && userId !== user?.uid ? (
              <>
                <input
                  type="checkbox"
                  id={`vote-${movie.id}-${userId}`}
                  name={`vote-${movie.id}-${userId}`}
                  checked={
                    votes?.selectedMovies
                      ?.find((targetMovie) => targetMovie.movieId === movie.id)
                      ?.votedBy.includes(user?.uid ?? "") ?? false
                  }
                  disabled={
                    (!votes?.selectedMovies
                      ?.find((targetMovie) => targetMovie.movieId === movie.id)
                      ?.votedBy.includes(user?.uid ?? "") &&
                      userVotesCast === votesAllowed) ??
                    false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(userId ?? "undefined", movie.id, e)
                  }
                />
                <label htmlFor={`vote-${movie.id}-${userId}`}>
                  {/* Vote for this movie */}
                  {/* Need to think about how this text will appear. */}
                  {/* Perhaps a hover tooltip; at minimum, an sr-only label */}
                </label>
              </>
            ) : null}
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
            {areGroupConditionsMet() &&
            isVotingDecided(votesAllowed, groupMembers.length - 1) &&
            votes?.selectedMovies[0].movieId === movie.id ? (
              <h2>{movie.title} has been selected!</h2>
            ) : null}
          </li>
          // Think about what info I want to display in each li. Right now it's title but I'll display:
          // -Run time
          // -Image/poster
          // -Genre??

          // I might also want to change things up so MovieInfo displays as an expanded li instead of re-directing to a new page.
        ))}
      </ul>

      <Link to="/addmovie">Add a movie</Link>
      {/* I may want to add a conditional message similar to MyGroups. Something like "Add your first movie to the list", or maybe refer to the search bar.*/}
    </>
  );
}

export default MovieList;
