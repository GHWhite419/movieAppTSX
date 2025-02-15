import MovieType from "../../types/MovieType";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { MovieContext, MovieContextType } from "../../context/MovieContext";
import { Link } from "react-router-dom";
import { VotingContext } from "../../context/VotingContext";
import { MemberType } from "../../types/GroupType";

interface MovieListProps {
  userId?: string;
  context: "home" | "group";
  groupId?: string;
  votesAllowed?: number;
  groupMembers?: MemberType[];
}

function MovieList(props: MovieListProps) {
  const { user } = useContext(AuthContext);
  const { getMovieList } = useContext(MovieContext) as MovieContextType;
  // GPT recommended I null guard instead of type cast like this. I wonder what devs think is the best practice?

  const votingContext = useContext(VotingContext);
  // I call the VotingContext methods differently here because HomePage uses this component without the context. This way we don't return null to HomePage, and ensure content actually renders.
  const getVotes =
    votingContext?.getVotes ??
    (() => {
      console.warn("getVotes called without VotingContext");
    });
  const voteForMovie =
    votingContext?.voteForMovie ??
    (() => {
      console.warn("voteForMovie called without VotingContext");
    });
  const unvoteForMovie =
    votingContext?.unvoteForMovie ??
    (() => {
      console.warn("unvoteForMovie called without VotingContext");
    });

  const [movies, setMovies] = useState<MovieType[]>([]);
  const [votes, setVotes] = useState<Pick<
    MemberType,
    "selectedMovies" | "votesReceived"
  > | null>(null);
  const [voteStatus, setVoteStatus] = useState<{
    leadingMovies: string[];
    leadingVotes: number;
    runnerUpVotes: number;
    remainingVotes: number;
  }>({
    leadingMovies: [],
    leadingVotes: 0,
    runnerUpVotes: 0,
    remainingVotes: 0,
  });

  useEffect(() => {
    const fetchMovies = async () => {
      if (props.userId) {
        const movieList = await getMovieList(props.userId);
        setMovies(movieList);
      }
    };
    fetchMovies();
    if (props.context === "group" && props.userId && props.groupId)
      fetchVotes(props.userId, props.groupId);
  }, []);

  const fetchVotes = async (userId: string, groupId: string) => {
    const votingData = await getVotes(userId, groupId);
    if (votingData) setVotes(votingData);
  };

  const handleCheckboxChange = async (
    userId: string,
    movieId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!user || !props.groupId || !props.userId) {
        throw new Error("User or groupId is missing");
      }
      if (e.target.checked) {
        await voteForMovie({
          userId: userId,
          votingUserId: user.uid,
          movieId: movieId,
          groupId: props.groupId,
        });
      } else {
        await unvoteForMovie({
          userId: userId,
          votingUserId: user.uid,
          movieId: movieId,
          groupId: props.groupId,
        });
      }
      await fetchVotes(props.userId, props.groupId);
    } catch (error) {
      console.log(error);
      throw new Error("Unknown Error voting");
      // Modify this message later perhaps
    }
  };

  const userVotesCast: number | undefined = votes?.votesReceived?.find(
    (targetUser) => targetUser.votingMember === user?.uid
  )?.votesCast;

  const movieVotesReceived = (movieId: string): number => {
    const targetMovieVotes = votes?.selectedMovies.find(
      (targetMovie) => targetMovie.movieId === movieId
    )?.totalVotes;
    if (targetMovieVotes) return targetMovieVotes;
    return 0;
  };

  // Move this to VotingContext
  const isTieBreakNeeded = (): boolean => {
    if (
      props.context !== "group" ||
      !votes?.votesReceived ||
      !props.votesAllowed ||
      !props.groupMembers
    )
      return false;

    const votesReceived = votes.votesReceived;
    const votesAllowed = props.votesAllowed;

    if (voteStatus.leadingMovies.length < 2) return false;

    if (props.groupMembers.length - 1 === votes.votesReceived.length) {
      const allVotesCast = votesReceived.every(
        (member) => member.votesCast >= votesAllowed
      );
      if (allVotesCast) return true;
    }

    return (
      voteStatus.runnerUpVotes + voteStatus.remainingVotes <
      voteStatus.leadingVotes
    );
  };

  // Move this to VotingContext
  const isVotingDecided = (): boolean => {
    if (props.context === "group" && props.groupMembers && props.votesAllowed) {
      if (voteStatus.leadingMovies.length === 0) return false;

      const groupMembers = props.groupMembers;
      const votesAllowed = props.votesAllowed;

      if (groupMembers.length - 1 === votes?.votesReceived.length) {
        const allVotesCast = votes?.votesReceived.every(
          (member) => member.votesCast >= votesAllowed
        );
        if (allVotesCast && voteStatus.leadingMovies.length === 1) return true;
      }

      return (
        voteStatus.leadingMovies.length === 1 &&
        voteStatus.leadingVotes >
          voteStatus.runnerUpVotes + voteStatus.remainingVotes
      );
    }
    return false;
  };

  useEffect(() => {
    // Move most of this logic to VotingContext
    if (
      !votes?.selectedMovies ||
      !votes?.votesReceived ||
      !props.votesAllowed
    ) {
      setVoteStatus({
        leadingMovies: [],
        leadingVotes: 0,
        runnerUpVotes: 0,
        remainingVotes: 0,
      });
    } else {
      const voteCounts: Record<string, number> = {};
      for (let movie of votes?.selectedMovies) {
        voteCounts[movie.movieId] = movie.totalVotes || 0;
      }

      const sortedMovies = Object.entries(voteCounts).sort(
        (a, b) => b[1] - a[1]
      );

      if (sortedMovies.length === 0) {
        setVoteStatus({
          leadingMovies: [],
          leadingVotes: 0,
          runnerUpVotes: 0,
          remainingVotes: 0,
        });
        return;
      }

      const leadVotes = sortedMovies[0][1];
      const leadingMoviesList = sortedMovies
        .filter(([_, votes]) => votes === leadVotes)
        .map(([movieId]) => movieId);

      const highestVotes = sortedMovies[0][1];

      const nextHighestVotes =
        sortedMovies.length > leadingMoviesList.length
          ? sortedMovies[leadingMoviesList.length][1]
          : 0;

      let totalRemainingVotes = 0;
      for (let member of votes.votesReceived) {
        totalRemainingVotes += props.votesAllowed - member.votesCast;
      }

      setVoteStatus({
        leadingMovies: leadingMoviesList,
        leadingVotes: highestVotes,
        runnerUpVotes: nextHighestVotes,
        remainingVotes: totalRemainingVotes,
      });
      if (isVotingDecided())
        console.log("Movie selected with ID:", voteStatus.leadingMovies[0]);
      // Create "selectMovie" method and call it here.
    }
  }, [votes]);

  return (
    <>
      {props.context === "group" && props.userId !== user?.uid ? (
        <h2>
          You have{" "}
          {props.votesAllowed && userVotesCast
            ? props.votesAllowed - userVotesCast
            : props.votesAllowed}{" "}
          {props.votesAllowed &&
          userVotesCast &&
          props.votesAllowed - userVotesCast === 1
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
            {props.userId && props.userId !== user?.uid ? (
              <>
                <input
                  type="checkbox"
                  id={`vote-${movie.id}-${props.userId}`}
                  name={`vote-${movie.id}-${props.userId}`}
                  checked={
                    votes?.selectedMovies
                      ?.find((targetMovie) => targetMovie.movieId === movie.id)
                      ?.votedBy.includes(user?.uid ?? "") ?? false
                  }
                  disabled={
                    (!votes?.selectedMovies
                      ?.find((targetMovie) => targetMovie.movieId === movie.id)
                      ?.votedBy.includes(user?.uid ?? "") &&
                      userVotesCast === props.votesAllowed) ??
                    false
                  }
                  onChange={(e) =>
                    handleCheckboxChange(
                      props.userId ?? "undefined",
                      movie.id,
                      e
                    )
                  }
                />
                <label htmlFor={`vote-${movie.id}-${props.userId}`}>
                  {/* Vote for this movie */}
                  {/* Need to think about how this text will appear. */}
                  {/* Perhaps a hover tooltip; at minimum, an sr-only label */}
                </label>
              </>
            ) : null}
            {props.context === "group" &&
            user?.uid === props.userId &&
            movieVotesReceived(movie.id) >= 1 &&
            isTieBreakNeeded() ? (
              // All votes should be in.
              <>
                <input
                  type="checkbox"
                  id={`tiebreak-${movie.id}-${props.userId}`}
                  name={`tiebreak-${movie.id}-${props.userId}`}
                />
                <label htmlFor=""></label>
              </>
            ) : null}
            {props.context === "group" && movieVotesReceived(movie.id) ? (
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

      <Link to="/addmovie">Add a movie</Link>
      {/* I may want to add a conditional message similar to MyGroups. Something like "Add your first movie to the list", or maybe refer to the search bar.*/}
    </>
  );
}

export default MovieList;
