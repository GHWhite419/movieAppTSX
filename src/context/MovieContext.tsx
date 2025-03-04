import MovieType from "../types/MovieType";
import React, { createContext, useContext /* useEffect */ } from "react";
import { db } from "../utility/Firebase";
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
import { AuthContext } from "./AuthContext";

export interface MovieContextType {
  createMovie: (movie: MovieType) => Promise<void>;
  getMovieList: (targetUserId: string) => Promise<MovieType[]>;
  getMovie: (movieId: string) => Promise<MovieType | null>;
  deleteMovie: (movieId: string) => Promise<void>;
  updateMovie: (movie: MovieType) => void;
}

export const MovieContext = createContext<MovieContextType | null>(null);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useContext(AuthContext);

  // const [userId, setUserId] = useState<string>("");

  // useEffect(() => {
  //   if (user) {
  //     setUserId(user.uid);
  //   }
  // }, [user]);

  // const userMovies = `users/${userId}/movies`;
  // We may switch to this codeblock above later if necessary for group-based viewing/editing methods.

  const userMovies = `users/${user?.uid}/movies`;
  // For now we stick with this

  const createMovie = async (movie: MovieType): Promise<void> => {
    try {
      // Add a new document with a generated id.
      const docRef = await addDoc(collection(db, userMovies), {
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

  const getMovieList = async (targetUserId: string): Promise<MovieType[]> => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${targetUserId}/movies`)
      );
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
        // Type assertion here to get rid of.
      });

      return movieList;
    } catch (error) {
      throw new Error("Error! Edit this message later");
      // Edit message later
    }
  };

  const getMovie = async (movieId: string): Promise<MovieType | null> => {
    const docRef = doc(db, userMovies, movieId);
    try {
      const docSnap = await getDoc(docRef);
      const movieData = docSnap.data() as MovieType;
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
      // Provide more details? Compare with MovieInfo and MovieForm error messages.
    }
  };

  const deleteMovie = async (movieId: string): Promise<void> => {
    try {
      const movieRef = doc(db, userMovies, movieId);
      const docSnapshot = await getDoc(movieRef);

      if (!docSnapshot.exists()) {
        throw new Error("Movie not found.");
      }

      await deleteDoc(movieRef);
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
        throw new Error(
          "Unexpected error updating movie. Please try again later."
        );
      }
    }

    console.log("Movie updated: ", movie.title, movie.id);
  };

  return (
    <MovieContext.Provider
      value={{
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
