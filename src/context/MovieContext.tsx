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
} from "firebase/firestore";
import { AuthContext } from "../firebase/AuthContext";

export interface MovieContextType {
  movies: MovieType[];
  createMovie: (movie: MovieType) => Promise<void>;
  getMovieList: () => Promise<void>;
  getMovie: (id: string) => Promise<MovieType | null>;
  deleteMovie: (id: string) => void;
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

  const createMovie = async (movie: MovieType) => {
    try {
      // Add a new document with a generated id.

      const docRef = await addDoc(collection(db, userMovies), {
        title: movie.title,
        dateAdded: new Date(),
      });

      getMovieList();
      console.log("Movie added with ID: ", docRef.id);
    } catch (e) {
      console.log("Error adding movie:", e);
    }
  };

  const getMovieList = async () => {
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

  const getMovie = async (id: string): Promise<MovieType | null> => {
    const docRef = doc(db, userMovies, id);
    try {
      const docSnap = await getDoc(docRef);
      const movieData = docSnap.data() as MovieType;
      console.log("Document data:,", docSnap.data());
      // Type assertion here - change later.
      return {
        id: docSnap.id,
        title: movieData.title,
        dateAdded:
          movieData.dateAdded instanceof Timestamp
            ? movieData.dateAdded.toDate()
            : new Date(movieData.dateAdded),
      };
    } catch (error) {
      console.log("No such document");
      throw new Error();
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      const movieRef = doc(db, userMovies, id);
      const docSnapshot = await getDoc(movieRef);

      if (!docSnapshot.exists()) {
        throw new Error("Movie not found.");
      }

      await deleteDoc(movieRef);
      getMovieList();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Movie not found.") {
          throw error;
        }
        throw new Error("Unexpected error deleting movie.");
      }
    }
  };

  const updateMovie = (movie: MovieType) => {
    console.log("Movie updated: ", movie.title);
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
