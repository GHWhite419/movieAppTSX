import "./App.css";
import Login from "./components/Login.tsx";
import MovieList from "./components/MovieList";
// import { onAuthStateChanged } from "firebase/auth";

// I'll start by creating and importing the most basic components.
// 1. A login component. Once a user signs in, they will be directed to their unique page.
// 2. A component to display a list of movies on the main page based on which user is logged in. Each movie should display the movie's name and  a button/link to expand and offer more information.
// 3. An individual movie component that displays all relevant information about a given film. The MovieList component will be a parent. I will likely need to create a Movie class or interface somewhere with all relevant info. Since I want to eventually incorporate an API, I should try to find one and model the class/interface after that.
// 4. A form component that allows a user to add a custom movie. This should likely utilize the Movie class/interface mentioned above.

// What other folders do I need? Not sure how people organize their TSX projects and what the best practices are.

function App() {
  const userLoggedIn: boolean = false;

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     // User is signed in, see docs for a list of available properties
  //     // https://firebase.google.com/docs/reference/js/auth.user
  //     const uid: string = "s8hlrskrxvdzB8z6tWYBivr6PWB2";
  //     // const uid = user.uid;
  //     console.log('User is signed in')
  //     console.log(uid);
  //     // ...
  //   } else {
  //     // User is signed out
  //     // ...
  //     console.log('User is signed out')
  //   }
  // });

  return (
    <>
      {/* // I'm thinking I can use a ternary to conditionally render the Login component depending on whether a user is logged in. I probably will also use Links/Router DOM for this */}
      {userLoggedIn ? <MovieList /> : <Login />}
    </>
  );
}

export default App;
