import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import MyGroups from "./groups/MyGroups";
import MovieList from "./movies/MovieList";

function HomePage() {
  const { user, logout } = useContext(AuthContext);

  const [showGroups, setShowGroups] = useState<boolean>(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const displayName: string | null = user ? user.email : "";
  // Eventually change to proper displayname.

  const handleGroupClick = () => {
    setShowGroups((prev) => !prev);
  };

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

      <MovieList userId={user?.uid} context="home"/>
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

export default HomePage;
