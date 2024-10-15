import MovieType from "../types/MovieType";
import React, { createContext, useState } from "react";
import { db } from "../firebase/Firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

export interface MovieContextType {
  movies: MovieType[];
  createMovie: (movie: MovieType) => Promise<void>;
  getMovieList: () => void;
  deleteMovie: (id: string) => void;
  updateMovie: (id: string) => void;
}

export const MovieContext = createContext<MovieContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export const MovieProvider: React.FC<Props> = ({ children }) => {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const createMovie = async (movie: MovieType) => {
    try {
      // Add a new document with a generated id.
      const docRef = await addDoc(collection(db, "movies"), {
        title: movie.title,
      });

      const newMovie: MovieType = {
        ...movie,
        id: docRef.id,
      };

      setMovies([...movies, newMovie]);
      console.log("Movie added with ID: ", docRef.id);
    } catch (e) {
      console.log("Error adding movie:", e);
    }
  };

  const getMovieList = async () => {
    const querySnapshot = await getDocs(collection(db, "movies"));
    const movieList: MovieType[] = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      const movieData = doc.data();
      const movie: MovieType = {
        id: doc.id,
        title: movieData.title,
      };

      movieList.push(movie);
    });
    setMovies(movieList);
  };

  const deleteMovie = async (id: string) => {
    await deleteDoc(doc(db, "movies", id));
    console.log("Movie deleted");
  };

  const updateMovie = (id: string) => {
    console.log("Movie updated");
  };

  return (
    <MovieContext.Provider
      value={{ movies, createMovie, getMovieList, deleteMovie, updateMovie }}
    >
      {children}
    </MovieContext.Provider>
  );
};
