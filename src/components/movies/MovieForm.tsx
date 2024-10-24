import { useContext, useState, useEffect } from "react";
import { MovieContext, MovieContextType } from "../../context/MovieContext";
import MovieType from "../../types/MovieType";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Since we're re-using this component for updateMovie, we want to pass a movie prop down. If it has data, this form should have the following behaviors:
// -Submit button should call updateMovie instead of addMovie, and say update instead of create (they might both say submit atm)
// -Form should be populated by pre-written info about the movie.
// -Back button should navigate to the individual movie's info, not the list.

const movieSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  year: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? undefined : value))
    // .transform((value) => {
    //   console.log("Year transform value: ", value);
    //   return isNaN(value) || value === "" ? undefined : value;
    // })
    .typeError("Year must be a number")
    .optional(),
  runtimeHours: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? undefined : value))
    .min(0)
    .typeError("Must be a number")
    .optional(),
  runtimeMinutes: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? undefined : value))
    .min(0)
    .max(59)
    .typeError("Must be a number")
    .optional(),
  genre: yup.string().optional(),
  description: yup.string().optional(),
  director: yup.string().optional(),
  starring: yup.string().optional(),
  //   Format this in a way that's consistent with other instances of MovieType
  // Do I need these last 4 optional fields? Test without them.
});

type FormData = Omit<MovieType, "id" | "dateAdded"> & {
  runtimeHours?: number;
  runtimeMinutes?: number;
};

function MovieForm() {
  const { movieId } = useParams<{ movieId: string }>();
  // const movieId = "lol";
  const [formError, setFormError] = useState<string | null>(null);
  const [movieToUpdate, setMovieToUpdate] = useState<MovieType | null>(null);

  const { createMovie, updateMovie, getMovie } = useContext(
    MovieContext
  ) as MovieContextType;
  // Type assertion to remove

  useEffect(() => {
    const fetchMovie = async () => {
      if (movieId) {
        try {
          const fetchedMovie = await getMovie(movieId);
          setMovieToUpdate(fetchedMovie);
        } catch (error) {
          console.error("Error fetching movie:", error);
          setFormError("fetchError");
        }
      } else {
        console.log("No movie ID found");
      }
    };
    fetchMovie();
  }, []);

  useEffect(() => {
    if (movieToUpdate) {
      console.log("Movie to update: ", movieToUpdate);
      reset({
        title: movieToUpdate.title,
        year: movieToUpdate.year || undefined,
        runtimeHours: movieToUpdate?.runtime
          ? movieToUpdate.runtime[0]
          : undefined,
        runtimeMinutes: movieToUpdate?.runtime
          ? movieToUpdate.runtime[1]
          : undefined,
        genre: movieToUpdate?.genre || "",
        description: movieToUpdate?.description || "",
        director: movieToUpdate?.director || "",
        starring: movieToUpdate?.starring || "",
      });
    }
  }, [movieToUpdate]);

  useEffect(() => {
    if (formError === "fetchError") {
      const timer = setTimeout(() => {
        navigate(-1);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setFormError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [formError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(movieSchema),
    defaultValues: {
      title: movieToUpdate?.title || "",
      year: movieToUpdate?.year || undefined,
      runtimeHours: movieToUpdate?.runtime
        ? movieToUpdate.runtime[0]
        : undefined,
      runtimeMinutes: movieToUpdate?.runtime
        ? movieToUpdate.runtime[1]
        : undefined,
      genre: movieToUpdate?.genre || "",
      description: movieToUpdate?.description || "",
      director: movieToUpdate?.director || "",
      starring: movieToUpdate?.starring || "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: FormData): Promise<void> => {
    const { runtimeHours, runtimeMinutes, ...otherData } = data;
    const runtimeArray: [number?, number?] = [runtimeHours, runtimeMinutes];
    try {
      if (movieToUpdate) {
        await updateMovie({
          ...otherData,
          id: movieToUpdate.id,
          dateAdded: movieToUpdate.dateAdded,
          runtime: runtimeArray,
        });
      } else {
        await createMovie({
          ...otherData,
          id: "placeholder",
          dateAdded: new Date(),
          runtime: runtimeArray,
        });
      }
      reset();
      navigate(-1);
    } catch (error) {
      if (error instanceof Error) {
        setFormError((error as Error).message);
      }
    }
  };

  if (formError === "fetchError") {
    return (
      <p>
        Error finding movie to edit. Please try again later. Redirecting to your
        movie...
      </p>
    );
  }

  return (
    <>
      <h2>Enter movie information here:</h2>
      {/* Maybe change this h2 text */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="title">Title*</label>
        <input {...register("title")} />
        {errors.title && <p>{errors.title.message}</p>}
        {/* Form validation should point out that this field is mandatory. */}
        <label htmlFor="year">Release year</label>
        <input type="number" {...register("year")} />
        {errors.year && <p>{errors.year.message}</p>}
        <div>
          <h3>Runtime</h3>
          <label htmlFor="runtimeHours">Hours</label>
          <input type="number" {...register("runtimeHours")} />
          {errors.runtimeHours && <p>{errors.runtimeHours.message}</p>}
          <label htmlFor="runtimeMinutes">Minutes</label>
          <input type="number" {...register("runtimeMinutes")} />
          {errors.runtimeMinutes && <p>{errors.runtimeMinutes.message}</p>}
        </div>
        <label htmlFor="genre">Genre</label>
        <input {...register("genre")} />
        <label htmlFor="description">Description</label>
        <textarea {...register("description")}></textarea>
        <label htmlFor="director">Directed by</label>
        <input {...register("director")} />
        <label htmlFor="starring">Starring</label>
        <input {...register("starring")} />

        <button type="submit">
          {movieToUpdate ? "Update movie" : "Add movie"}
        </button>
      </form>
      {formError && <p>{formError}</p>}
      <Link to="/">Cancel</Link>
    </>
  );
  //   Input labels should match those on MovieInfo
}

export default MovieForm;
