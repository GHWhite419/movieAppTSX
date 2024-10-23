import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { MovieContext, MovieContextType } from "../context/MovieContext";
import MovieType from "../types/MovieType";
import ConfirmDelete from "./ConfirmDelete";

function MovieInfo() {
  const { movieId } = useParams<{ movieId: string }>();
  const { getMovie, deleteMovie, updateMovie } = useContext(
    MovieContext
  ) as MovieContextType;
  //   Again, eventually move to a null guard instead of a type assertion here.
  const [movie, setMovie] = useState<MovieType | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isMovieDeleted, setIsMovieDeleted] = useState<boolean>(false);

  const navigate = useNavigate();

  const toggleDeleteModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    const fetchMovie = async () => {
      if (movieId) {
        try {
          const fetchedMovie = await getMovie(movieId);
          setMovie(fetchedMovie);
          setStatus("");
        } catch (error) {
          console.error("Error fetching movie:", error);
          setStatus("redirecting");
        }
      }
    };
    fetchMovie();
  }, [movieId, getMovie]);

  useEffect(() => {
    if (status === "redirecting") {
      const timer = setTimeout(() => {
        navigate(-1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (status === "deleteError") {
      const timer = setTimeout(() => {
        setStatus("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleDelete = async () => {
    try {
      if (movie) {
        await deleteMovie(movie.id);
        setMovie(null);
        setIsMovieDeleted(true);
        setStatus("redirecting");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      setStatus("deleteError");
    } finally {
      setShowModal(false);
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  if (!movie) {
    if (isMovieDeleted === true)
      return <p>Movie deleted. Redirecting to your list...</p>;
    else {
      return <p>Movie not found. Redirecting to your list...</p>;
    }
  }

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
      <p>Release year: {movie.year || ""}</p>
      <p>
        Runtime:{" "}
        {movie.runtime &&
        (movie.runtime[0] !== null || movie.runtime[1] !== null)
          ? `${movie.runtime[0] || 0}:${String(movie.runtime[1] || 0).padStart(
              2,
              "0"
            )}`
          : ""}
      </p>
      <p>Genre: {movie.genre}</p>
      <p>Directed by: {movie.director}</p>
      <p>Starring: {movie.starring}</p>
      <p>Description: {movie.description}</p>
      <Link to="/">Back</Link>
      <button type="button" onClick={() => updateMovie(movie)}>
        Edit
      </button>
      <button type="button" onClick={() => toggleDeleteModal()}>
        Delete
      </button>
      <p
        style={
          status === "deleteError" ? { display: "flex" } : { display: "none" }
        }
      >
        Error deleting movie. Please try again later.
      </p>
      <ConfirmDelete
        movieTitle={movie.title}
        movieId={movie.id}
        open={showModal}
        onClose={toggleDeleteModal}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default MovieInfo;
