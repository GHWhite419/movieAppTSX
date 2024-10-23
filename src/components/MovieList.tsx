import MovieType from "../types/MovieType";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { MovieContext, MovieContextType } from "../context/MovieContext";
import { Link } from "react-router-dom";

function MovieList() {
  const { user, logout } = useContext(AuthContext);
  const { movies, getMovieList } = useContext(MovieContext) as MovieContextType;
  // GPT recommended I null guard instead of type cast like this. I wonder what devs think is the best practice?
  // const [movieTitle, setMovieTitle] = useState<string>("");
  // This add-a-movie form will eventually need to be moved into a createMovie component, and will likely need a useReducer hook. Will need to figure out how to do that.
  const [logoutError, setLogoutError] = useState<string | null>(null);

  useEffect(() => {
    getMovieList();
  }, []);

  let displayName: string | null;
  if (user) {
    displayName = user.email;
  } else {
    displayName = "User";
  }
  // Eventually change to proper displayname. Otherwise, display null? idk

  const logoutButton = async (): Promise<void> => {
    try {
      await logout();
      setLogoutError(null);
    } catch (error) {
      setLogoutError(
        "Something went wrong while signing out. Please try again."
      );
    }
  };

  return (
    <>
      {/* We'll eventually want to display the following in this component:
    -Search bar
    -View groups
    -Form a group
    -Group invites??
    -Menu to alter user settings
     */}
      <h1>Hello {displayName}</h1>
      <h2>Your list:</h2>
      <ul>
        {movies.map((movie: MovieType) => (
          <li key={movie.id}>
            <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
          </li>
        ))}
      </ul>

      <Link to="custommovie">Add a movie</Link>

      <button
        type="button"
        onClick={() => {
          logoutButton();
        }}
        onBlur={() => setLogoutError(null)}
      >
        Log out
      </button>
      {logoutError && <p>{logoutError}</p>}
      {/* Under what condition should this message disappear? When user clicks off or does something else? */}
    </>
  );
}

export default MovieList;
