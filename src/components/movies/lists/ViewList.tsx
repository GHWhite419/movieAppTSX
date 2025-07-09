import MovieType from "../../../types/MovieType";
import { MemberType } from "../../../types/GroupType";
import { Link } from "react-router-dom";

interface ViewListProps {
  context: "home" | "group";
  movies: MovieType[] | null;
  votes: Pick<MemberType, "selectedMovies" | "votesReceived"> | null;
  movieVotesReceived: (movieId: string) => number;
}

function ViewList({
  context = "home",
  movies,
  movieVotesReceived,
}: ViewListProps & {}) {

  return (
    <ul>
      {/* We have a conditional render here. If there's no data to display in movies (ie null), we should display a message encouraging the user to add/search for their first movie. */}
      {movies?.map((movie: MovieType) => (
        <li key={movie.id}>
          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
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
  );
}

export default ViewList;
