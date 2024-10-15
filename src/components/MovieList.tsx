import MovieType from "../types/MovieType";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { MovieContext, MovieContextType } from "../context/MovieContext";

function MovieList() {
  const { logout } = useContext(AuthContext);
  const { movies, createMovie, getMovieList, deleteMovie } = useContext(
    MovieContext
  ) as MovieContextType;
  // GPT recommended I null guard instead of type cast like this. I wonder what devs think is the best practice?
  const [movieTitle, setMovieTitle] = useState<string>("");
  // This add-a-movie form will eventually need to be moved into a createMovie component, and will likely need a useReducer hook. Will need to figure out how to do that.

  useEffect(() => {
    getMovieList();
  }, []);

  const deleteButton = (movie: MovieType) => {
    console.log(`You deleted ${movie.title}`);
  };

  return (
    <>
      <h1>Hello Galen{/* This will be replaced by the user's name */}</h1>
      <h2>Your list:</h2>
      <ul>
        {movies.map((movie: MovieType) => (
          <li>
            {movie.title}
            {/* <button type="button" onClick={() => deleteMovie(movie.id)}>
              X
            </button> */}
          </li>
        ))}
      </ul>

      <form
        action="submit"
        onSubmit={(e) => {
          e.preventDefault();
          createMovie({
            title: movieTitle,
          });
          console.log("Movie added: ", movieTitle);
          setMovieTitle("");
        }}
      >
        <label htmlFor="movieTitle"></label>
        <input
          type="text"
          name="movieTitle"
          id="movieTitle"
          value={movieTitle}
          onChange={(e) => {
            setMovieTitle(e.target.value);
          }}
        />
        <button type="submit">Add movie</button>
      </form>

      <button
        type="button"
        onClick={() => {
          console.log("Logging out...");
          logout();
        }}
      >
        Log out
      </button>
    </>
  );
}

export default MovieList;
