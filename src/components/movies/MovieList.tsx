import MovieType from "../../types/MovieType";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { MovieContext, MovieContextType } from "../../context/MovieContext";
import { Link } from "react-router-dom";
import { VotingContext } from "../../context/VotingContext";

interface MovieListProps {
  userId?: string;
  context: "home" | "group";
  groupId?: string;
}

function MovieList(props: MovieListProps) {
  const { user } = useContext(AuthContext);
  const { getMovieList } = useContext(MovieContext) as MovieContextType;

  // I call the VotingContext differently here because HomePage uses this component without the context. This way we don't return null to HomePage, and ensure content actually renders.
  const votingContext = useContext(VotingContext);
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
  // const { voteForMovie, unvoteForMovie } = useContext(
  //   VotingContext
  // ) as VotingContextType;
  // GPT recommended I null guard instead of type cast like this. I wonder what devs think is the best practice?
  const [movies, setMovies] = useState<MovieType[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (props.userId) {
        const movieList = await getMovieList(props.userId);
        setMovies(movieList);
      }
    };
    fetchMovies();
  }, []);

  const handleCheckboxChange = (
    userId: string,
    movieId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user || !props.groupId || !props.userId) {
      throw new Error("User or groupId is missing");
    }
    if (e.target.checked) {
      voteForMovie({
        userId: userId,
        votingUserId: user.uid,
        movieId: movieId,
        groupId: props.groupId,
      });
    } else if (!e.target.checked) {
      unvoteForMovie({
        userId: userId,
        votingUserId: user.uid,
        movieId: movieId,
        groupId: props.groupId,
      });
    } else {
      throw new Error("Unknown Error voting");
      // Modify this message later perhaps
    }
    // getVotes()
  };

  return (
    <>
      <ul>
        {/* We have a conditional render here. If there's no data to display in movies (ie null), we should display a message encouraging the user to add/search for their first movie. */}
        {movies?.map((movie: MovieType) => (
          <li key={movie.id}>
            <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
            {props.userId && props.userId !== user?.uid ? (
              <input
                type="checkbox"
                id={`vote-${movie.id}-${props.userId}`}
                name={`vote-${movie.id}-${props.userId}`}
                onChange={(e) =>
                  handleCheckboxChange(props.userId ?? "undefined", movie.id, e)
                }
              />
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
