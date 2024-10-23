import { useContext, useState } from "react";
import { MovieContext, MovieContextType } from "../context/MovieContext";
import MovieType from "../types/MovieType";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const movieSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  year: yup
    .number()
    // .transform((value) => (isNaN(value) || value === "" ? undefined : value))
    .transform((value) => {
      console.log("Year transform value: ", value);
      return isNaN(value) || value === "" ? undefined : value;
    })
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
});

type FormData = Omit<MovieType, "id" | "dateAdded"> & {
  runtimeHours?: number;
  runtimeMinutes?: number;
};

function CreateMovie() {
  const { createMovie } = useContext(MovieContext) as MovieContextType;
  // Type assertion to remove
  const [createMovieError, setCreateMovieError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(movieSchema),
    defaultValues: {
      title: "",
      year: undefined,
      runtimeHours: undefined,
      runtimeMinutes: undefined,
      genre: "",
      description: "",
      director: "",
      starring: "",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: FormData): Promise<void> => {
    const { runtimeHours, runtimeMinutes, ...otherData } = data;
    const runtimeArray: [number?, number?] = [runtimeHours, runtimeMinutes];
    try {
      await createMovie({
        ...otherData,
        id: "placeholder",
        dateAdded: new Date(),
        runtime: runtimeArray,
      });
      reset();
      navigate(-1);
    } catch (error) {
      if (error instanceof Error) {
        setCreateMovieError((error as Error).message);
      }
    }
  };

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

        <button type="submit">Submit</button>
      </form>
      {createMovieError && <p>{createMovieError}</p>}
      <Link to="/">Cancel</Link>
    </>
  );
  //   Input labels should match those on MovieInfo
}

export default CreateMovie;
