import MovieType from "../types/MovieType";
import React, { createContext, useState, useContext } from "react";
import { db } from "../firebase/Firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { AuthContext } from "../firebase/AuthContext";

export interface MovieContextType {
  movies: MovieType[];
  createMovie: (movie: MovieType) => Promise<void>;
  getMovieList: () => Promise<void>;
  getMovie: (id: string) => Promise<MovieType | null>;
  deleteMovie: (id: string) => Promise<void>;
  updateMovie: (movie: MovieType) => void;
}

export const MovieContext = createContext<MovieContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export const MovieProvider: React.FC<Props> = ({ children }) => {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const { user } = useContext(AuthContext);
  let userMovies: string = "movies";
  // Could maybe remove this variable

  if (user) {
    userMovies = `users/${user.uid}/movies`;
  } else {
    userMovies = "movies";
  }

  const createMovie = async (movie: MovieType): Promise<void> => {
    try {
      // Add a new document with a generated id.
      const docRef = await addDoc(collection(db, userMovies), 
      {
        title: movie.title,
        dateAdded: new Date(),
        year: movie.year || null,
        runtime: movie.runtime
          ? [
              movie.runtime[0] !== undefined ? movie.runtime[0] : null,
              movie.runtime[1] !== undefined ? movie.runtime[1] : null,
            ]
          : [null, null],
        genre: movie.genre || "",
        description: movie.description || "",
        director: movie.director || "",
        starring: movie.starring || "",
      });
      console.log("Movie added with ID: ", docRef.id);
    } catch (error) {
      console.log("Error adding movie:", error);
      throw new Error(
        "Unexpected error creating movie. Please try again later."
      );
    }
  };

  const getMovieList = async (): Promise<void> => {
    const querySnapshot = await getDocs(collection(db, userMovies));
    const movieList: MovieType[] = querySnapshot.docs.map((doc) => {
      const movieData = doc.data();
      return {
        id: doc.id,
        title: movieData.title,
        dateAdded:
          movieData.dateAdded instanceof Timestamp
            ? movieData.dateAdded.toDate()
            : movieData.dateAdded,
      } as MovieType;
    });
    setMovies(movieList);
  };
  // This needs some error handling

  const getMovie = async (id: string): Promise<MovieType | null> => {
    const docRef = doc(db, userMovies, id);
    try {
      const docSnap = await getDoc(docRef);
      const movieData = docSnap.data() as MovieType;
      // console.log("Document data:,", docSnap.data());
      // Type assertion here - change later.
      return {
        id: docSnap.id,
        title: movieData.title,
        dateAdded:
          movieData.dateAdded instanceof Timestamp
            ? movieData.dateAdded.toDate()
            : new Date(movieData.dateAdded),
        year: movieData.year,
        runtime: movieData.runtime,
        genre: movieData.genre,
        director: movieData.director,
        starring: movieData.starring,
        description: movieData.description,
      };
    } catch (error) {
      console.log("No such document");
      throw new Error();
    }
  };

  const deleteMovie = async (id: string): Promise<void> => {
    try {
      const movieRef = doc(db, userMovies, id);
      const docSnapshot = await getDoc(movieRef);

      if (!docSnapshot.exists()) {
        throw new Error("Movie not found.");
      }

      await deleteDoc(movieRef);
      getMovieList();
    } catch (error: unknown) {
      // Error: unknown? Should I change this?
      if (error instanceof Error) {
        if (error.message === "Movie not found.") {
          throw error;
        }
        throw new Error(
          "Unexpected error deleting movie. Please try again later."
        );
      }
    }
  };

  const updateMovie = async (movie: MovieType): Promise<void> => {
    const docRef = doc(db, userMovies, movie.id);
    try {
      await updateDoc(docRef, {
        title: movie.title,
        year: movie.year || null,
        runtime: movie.runtime
          ? [
              movie.runtime[0] !== undefined ? movie.runtime[0] : null,
              movie.runtime[1] !== undefined ? movie.runtime[1] : null,
            ]
          : [null, null],
        genre: movie.genre || "",
        description: movie.description || "",
        director: movie.director || "",
        starring: movie.starring || "",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Unexpected error updating movie. Please try again later.");
      }
    }

    console.log("Movie updated: ", movie.title, movie.id);
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        createMovie,
        getMovieList,
        getMovie,
        deleteMovie,
        updateMovie,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
