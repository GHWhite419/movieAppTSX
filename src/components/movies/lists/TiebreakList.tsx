// function TiebreakList() {
//   return (
//     <ul>
//       {/* We have a conditional render here. If there's no data to display in movies (ie null), we should display a message encouraging the user to add/search for their first movie. */}
//       {movies?.map((movie: MovieType) => (
//         <li key={movie.id}>
//           <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
// {/* Probably don't need the conditional render on the checkboxes, since this is being handled in MovieList */}
//           {areGroupConditionsMet() &&
//           user?.uid === userId &&
//           movieVotesReceived(movie.id) >= 1 &&
//           isTieBreakNeeded(votesAllowed, groupMembers.length - 1) ? (
//             // All votes should be in.
//             <>
//               <input
//                 type="checkbox"
//                 id={`tiebreak-${movie.id}-${userId}`}
//                 name={`tiebreak-${movie.id}-${userId}`}
//               />
//               <label htmlFor=""></label>
//             </>
//           ) : null}
//           {context === "group" && movieVotesReceived(movie.id) ? (
//             <p>
//               has {movieVotesReceived(movie.id)}{" "}
//               {movieVotesReceived(movie.id) === 1 ? "vote" : "votes"}
//             </p>
//           ) : null}
//         </li>
//         // Think about what info I want to display in each li. Right now it's title but I'll display:
//         // -Run time
//         // -Image/poster
//         // -Genre??

//         // I might also want to change things up so MovieInfo displays as an expanded li instead of re-directing to a new page.
//       ))}
//     </ul>
//   );
// }

// export default TiebreakList