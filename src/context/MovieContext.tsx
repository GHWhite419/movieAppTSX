import MovieType from "../types/MovieType";
import React, { createContext, useState, useContext } from "react";
import { db } from "../firebase/Firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { AuthContext } from "../firebase/AuthContext";

export interface MovieContextType {
  movies: MovieType[];
  createMovie: (movie: MovieType) => Promise<void>;
  getMovieList: () => void;
  deleteMovie: (id: string) => void;
  // updateMovie: (id: string) => void;
}

export const MovieContext = createContext<MovieContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export const MovieProvider: React.FC<Props> = ({ children }) => {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const { user } = useContext(AuthContext);
  let userMovies: string = "movies";

  if (user) {
    userMovies = `users/${user.uid}/movies`;
    // userMovies = 'movies'
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
      } as MovieType;
    });
    setMovies(movieList);
  };

  const deleteMovie = async (id: string) => {
    try {
      await deleteDoc(doc(db, userMovies, id));
      getMovieList();
    } catch (e) {
      console.log("Error deleting movie:", e);
    }
  };

  // const updateMovie = (id: string) => {
  //   console.log("Movie updated");
  // };

  return (
    <MovieContext.Provider
      value={{ movies, createMovie, getMovieList, deleteMovie, 
        // updateMovie 
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
