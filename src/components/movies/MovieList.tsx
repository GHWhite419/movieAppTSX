import MovieType from "../../types/MovieType";
import MyGroups from "../groups/MyGroups";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../firebase/AuthContext";
import { MovieContext, MovieContextType } from "../../context/MovieContext";
import { Link } from "react-router-dom";

function MovieList() {
  const { user, logout } = useContext(AuthContext);
  const { movies, getMovieList } = useContext(MovieContext) as MovieContextType;
  // GPT recommended I null guard instead of type cast like this. I wonder what devs think is the best practice?
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [showGroups, setShowGroups] = useState<boolean>(false);

  useEffect(() => {
    getMovieList();
  }, []);

  const displayName: string | null = user ? user.email : "";
  // Eventually change to proper displayname.

  const logoutButton = async (): Promise<void> => {
    try {
      await logout();
      setLogoutError(null);
    } catch (error) {
      setLogoutError(
        "Something went wrong while signing out. Please try again."
      );
    }
  };

  const handleGroupClick = () => {
    setShowGroups((prev) => !prev);
  };

  return (
    <>
      {/* We'll eventually want to display the following in this component:
    -Search bar
    -View groups - DONE
    -Form a group - DONE
    -Menu to alter user settings

    -Group invites?? (Should be accessible from group's display)
    */}

      {/* I've commented out the symantic divs (header, body, footer). I'll need to figure out how to render them properly so they aren't nested under a generic div or fragment or something. */}

      {/* <header> */}
      <nav>
        <ul>
          <li>
            <button
              type="button"
              onClick={handleGroupClick}
              style={{ cursor: "pointer" }}
            >
              My groups
            </button>
            {showGroups && <MyGroups />}
          </li>
        </ul>
      </nav>
      {/* </header> */}
      {/* <body> */}
      <h1>Hello {displayName}</h1>
      <h2>Here's your movie list:</h2>
      <ul>
        {movies.map((movie: MovieType) => (
          <li key={movie.id}>
            <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
          </li>
          // Think about what info I want to display in each li. Right now it's title but I'll display:
          // -Run time
          // -Image/poster
          // -Genre??

          // I might also want to change things up so MovieInfo displays as an expanded li instead of re-directing to a new page.
        ))}
      </ul>

      <Link to="addmovie">Add a movie</Link>
      {/* I may want to add a conditional message similar to MyGroups. Something like "Add your first movie to the list", or maybe refer to the search bar.*/}

      {/* </body> */}

      {/* <footer> */}
      <button
        type="button"
        onClick={() => {
          logoutButton();
        }}
        onBlur={() => setLogoutError(null)}
      >
        Log out
      </button>
      {logoutError && <p>{logoutError}</p>}
      {/* </footer> */}
      {/* Under what condition should this message disappear? When user clicks off or does something else? */}
    </>
  );
}

export default MovieList;
