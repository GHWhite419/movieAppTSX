import MovieType from "../../../types/MovieType";
import { MemberType } from "../../../types/GroupType";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import useVoting from "../../../hooks/useVoting";
import { Link } from "react-router-dom";

interface VoteListProps {
  userId?: string;
  context: "home" | "group";
  groupId?: string;
  movies: MovieType[] | null;
  votes: Pick<MemberType, "selectedMovies" | "votesReceived"> | null;
  votesAllowed: number;
  userVotesCast: string[];
  setUserVotesCast: (
    votes: string[] | ((prevVotes: string[]) => string[])
  ) => void;
  voteCount: number;
  setVoteCount: (count: number | ((prevCount: number) => number)) => void;
  movieVotesReceived: (movieId: string) => number;
  switchToView: () => void;
}

function VoteList({
  userId,
  context,
  groupId,
  movies,
  votesAllowed,
  userVotesCast,
  setUserVotesCast,
  voteCount,
  setVoteCount,
  movieVotesReceived,
  switchToView,
}: VoteListProps) {
  const { user } = useContext(AuthContext);
  const { updateVotes } = useVoting();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const movieId = e.target.value;
    console.log("Is checked?", isChecked);
    setUserVotesCast((prevVotes: string[]) => {
      if (isChecked) {
        return [...prevVotes, movieId];
      } else {
        return prevVotes.filter((id) => id !== movieId);
      }
    });
    setVoteCount((prevCount) => (isChecked ? prevCount + 1 : prevCount - 1));
  };

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
        voteArray.push(entry[1].toString());
      }
      console.log(voteArray);
      console.log(voteArray.length);
      if (votesAllowed && voteArray.length > votesAllowed) {
        throw new Error(
          `You can only cast ${votesAllowed} votes. Please try again.`
        );
      } else {
        await updateVotes(userId, user.uid, voteArray, groupId);
        switchToView();
      }
    } catch (error) {
      console.log(error);
      throw new Error("Unknown Error voting");
      // Modify this message later perhaps
    }
  };

  return (
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
      </h2>
      <ul>
        {movies?.map((movie: MovieType) => (
          <li key={movie.id}>
            <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
            {userId && userId !== user?.uid ? (
              <>
                {/* I probably no longer need the conditional statements for the checkboxes, since the conditonal check will be handled in MovieList.tsx */}
                <input
                  type="checkbox"
                  id={`vote-${movie.id}-${userId}`}
                  name={`vote-${movie.id}-${userId}`}
                  value={movie.id}
                  defaultChecked={userVotesCast.includes(movie.id)}
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
      <button type="button" onClick={() => switchToView()}>
        Cancel
      </button>
    </form>
  );
}

export default VoteList;
