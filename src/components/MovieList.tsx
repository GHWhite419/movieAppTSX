import { useContext } from "react";
import { AuthContext } from "../firebase/AuthContext";

function MovieList() {
  const { logout } = useContext(AuthContext);

  return (
    <>
      {/* This is a placeholder for now which will eventually dynamically display a user's movie list from the database.*/}
      <h1>Hello Galen{/* This will be replaced by the username */}</h1>
      <h2>Your list:</h2>
      <ul>
        <li>Silence of the Lambs</li>
        <li>The Shawshank Redemption</li>
        <li>All Quiet on the Western Front</li>
      </ul>
      <button>Add movie</button>

      <button
        type="button"
        onClick={() => {
          console.log("Logging out...");
          logout();
        }}
      >
        Log out
      </button>
    </>
  );
}

export default MovieList;
