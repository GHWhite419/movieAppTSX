import "./App.css";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp.tsx";
import PasswordReset from "./components/auth/PasswordReset";
import MovieList from "./components/movies/MovieList.tsx";
import MovieInfo from "./components/movies/MovieInfo.tsx";
import MovieForm from "./components/movies/MovieForm.tsx";
import GroupForm from "./components/groups/GroupForm.tsx";
import GroupPage from "./components/groups/GroupPage.tsx";
import JoinGroup from "./components/groups/JoinGroup.tsx";

// import { useContext } from "react";
// import { AuthContext } from "./firebase/AuthContext.tsx";
import { MovieProvider } from "./context/MovieContext.tsx";
import { GroupProvider } from "./context/GroupContext.tsx";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./utility/ProtectedRoute.tsx";

function App() {
  // const { user } = useContext(AuthContext);

  return (
    <>
      <MovieProvider>
        <GroupProvider>
          <Routes>
            {/* Public Routes - Any user can view these*/}
            <Route path="/" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="passreset" element={<PasswordReset />} />
            <Route path="/groups/join/:groupId" element={<JoinGroup />} />

            {/* Private Routes - Authentication required*/}
            <Route
              path="movieList"
              element={
                <ProtectedRoute>
                  <MovieList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies/:movieId"
              element={
                <ProtectedRoute>
                  <MovieInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="addmovie"
              element={
                <ProtectedRoute>
                  <MovieForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies/:movieId/editmovie"
              element={
                <ProtectedRoute>
                  <MovieForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creategroup"
              element={
                <ProtectedRoute>
                  <GroupForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <GroupPage />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/groups/join/:groupId"
              element={
                <ProtectedRoute>
                  <JoinGroup />
                </ProtectedRoute>
              }
            /> */}
          </Routes>
        </GroupProvider>
      </MovieProvider>
    </>
    // <>
    //   {/* <header></header> */}
    //   {/* <body> */}

    //   {user ? (
    //     <MovieProvider>
    //       <GroupProvider>
    //         <Routes>
    //           <Route path="/" element={<MovieList />} />
    //           <Route path="/movies/:movieId" element={<MovieInfo />} />
    //           <Route path="addmovie" element={<MovieForm />} />
    //           <Route
    //             path="/movies/:movieId/editmovie"
    //             element={<MovieForm />}
    //           />
    //           <Route path="/creategroup" element={<GroupForm />} />
    //           <Route path="/groups/:groupId" element={<GroupPage />} />
    //           <Route path="/groups/join/:groupId" element={<JoinGroup />} />
    //         </Routes>
    //       </GroupProvider>
    //     </MovieProvider>
    //   ) : (
    //     <GroupProvider>
    //       <Routes>
    //         <Route path="/" element={<Login />} />
    //         <Route path="signup" element={<SignUp />} />
    //         <Route path="passreset" element={<PasswordReset />} />
    //         <Route path="/groups/join/:groupId" element={<JoinGroup />} />
    //       </Routes>
    //     </GroupProvider>
    //   )}

    //   {/* </body> */}
    //   {/* <footer></footer> */}
    // </>
  );
}

export default App;
