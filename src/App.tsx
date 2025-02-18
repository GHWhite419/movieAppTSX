import "./App.css";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp.tsx";
import PasswordReset from "./components/auth/PasswordReset";
import HomePage from "./components/HomePage.tsx";
import MovieInfo from "./components/movies/MovieInfo.tsx";
import MovieForm from "./components/movies/MovieForm.tsx";
import GroupForm from "./components/groups/GroupForm.tsx";
import GroupPage from "./components/groups/GroupPage.tsx";
import MemberPage from "./components/groups/MemberPage.tsx";
import JoinGroup from "./components/groups/JoinGroup.tsx";

import { MovieProvider } from "./context/MovieContext.tsx";
import { GroupProvider } from "./context/GroupContext.tsx";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./utility/ProtectedRoute.tsx";

function App() {
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
              path="home"
              element={
                <ProtectedRoute>
                  <HomePage />
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

            <Route
              path="/groups/:groupId/members/:memberId"
              element={
                <ProtectedRoute>
                  <MemberPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </GroupProvider>
      </MovieProvider>
    </>
  );
}

export default App;
