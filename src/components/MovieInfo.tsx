import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { MovieContext, MovieContextType } from "../context/MovieContext";
import MovieType from "../types/MovieType";
// import { Timestamp } from "firebase/firestore";

function MovieInfo() {
  const { movieId } = useParams<{ movieId: string }>();
  const { getMovie, deleteMovie, updateMovie } = useContext(
    MovieContext
  ) as MovieContextType;
  //   Again, eventually move to a null guard instead of a type assertion here.
  const [movie, setMovie] = useState<MovieType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const deleteConfirm = (movie: MovieType) => {
    console.log(`You deleted ${movie.title}`);
    deleteMovie(movie.id);
  };

  useEffect(() => {
    const fetchMovie = async () => {
      if (movieId) {
        try {
          const fetchedMovie = await getMovie(movieId);
          setMovie(fetchedMovie);
        } catch (error) {
          console.error("Error fetching movie:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMovie();
  }, [movieId, getMovie]);

  if (loading) return <p>Loading...</p>;

  if (!movie) return <p>Movie not found</p>;

  return (
    <>
      <h1>{movie.title}</h1>
      <p>
        Added to list on:{" "}
        {movie.dateAdded.toLocaleString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </p>
      <p>Release year: {movie.year}</p>
      <p>Runtime: {movie.runtime}</p>
      <p>Genre: {movie.genre}</p>
      <p>Directed by: {movie.director}</p>
      <p>Starring: {movie.starring}</p>
      <p>Description: {movie.description}</p>

      <Link to="/">Back</Link>
      <button type="button" onClick={() => updateMovie(movie)}>Edit</button>
      <button type="button" onClick={() => deleteConfirm(movie)}>
        X
      </button>
    </>
  );
}

export default MovieInfo;
