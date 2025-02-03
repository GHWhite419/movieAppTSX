import React, { createContext } from "react";
import { db } from "../utility/Firebase";
import {
  doc,
  // getDocs,
  getDoc,
  // query,
  // collection,
  // setDoc, updateDoc
  runTransaction,
} from "firebase/firestore";
import { MemberType } from "../types/GroupType";

export interface VotingContextType {
  getVotes: (
    userId: string,
    groupId: string
  ) => Promise<Pick<MemberType, "selectedMovies" | "votesReceived"> | null>;
  voteForMovie: ({
    userId,
    votingUserId,
    movieId,
    groupId,
  }: VoteParams) => Promise<void>;
  unvoteForMovie: ({
    userId,
    votingUserId,
    movieId,
    groupId,
  }: VoteParams) => Promise<void>;
}

interface VoteParams {
  userId: string;
  votingUserId: string;
  movieId: string;
  groupId: string;
}

export const VotingContext = createContext<VotingContextType | null>(null);

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getVotes = async (
    userId: string,
    groupId: string
  ): Promise<Pick<MemberType, "selectedMovies" | "votesReceived"> | null> => {
    try {
      const userRef = doc(db, "groups", groupId, "members", userId);
      const userSnap = await getDoc(userRef);

      const userData = userSnap.data();
      return {
        selectedMovies: userData?.selectedMovies,
        votesReceived: userData?.votesReceived,
      };
    } catch (error) {
      console.log(error);
      // throw new Error("Error getting votes");
      return null;
    }
  };

  const voteForMovie = async ({
    userId,
    votingUserId,
    movieId,
    groupId,
  }: VoteParams) => {
    try {
      await runTransaction(db, async (transaction) => {
        const groupRef = doc(db, "groups", groupId);
        const memberRef = doc(db, `groups/${groupId}/members`, userId);

        const groupSnap = await transaction.get(groupRef);
        const memberSnap = await transaction.get(memberRef);

        if (!groupSnap.exists()) {
          throw new Error("Group not found");
        }

        const memberData = memberSnap.exists()
          ? memberSnap.data()
          : { selectedMovies: [], votesReceived: [] };

        const groupData = groupSnap.data();
        const votesAllowed = groupData?.options.votesAllowed ?? 1;

        const selectedMovies = memberData.selectedMovies || [];
        const votesReceived = memberData.votesReceived || [];

        const targetMovie = selectedMovies.find(
          (m: MemberType["selectedMovies"][number]) => m.movieId === movieId
        );

        if (!targetMovie) {
          selectedMovies.push({
            movieId: movieId,
            totalVotes: 1,
            votedBy: [votingUserId],
          });
        } else if (!targetMovie.votedBy.includes(votingUserId)) {
          targetMovie.totalVotes += 1;
          targetMovie.votedBy.push(votingUserId);
        } else {
          throw new Error("User has already voted for this movie.");
        }

        const userVote = votesReceived.find(
          (v: MemberType["votesReceived"][number]) =>
            v.votingMember === votingUserId
        );

        if (!userVote) {
          votesReceived.push({ votingMember: votingUserId, votesCast: 1 });
        } else if (userVote.votesCast < votesAllowed) {
          userVote.votesCast += 1;
        } else {
          throw new Error("Vote limit reached for this user.");
        }

        transaction.set(
          memberRef,
          { selectedMovies, votesReceived },
          { merge: true }
        );
      });
    } catch (error) {
      console.log("Voting failed:", error);
      throw new Error("Voting failed");
      // Can modify this message later.
    }
  };

  const unvoteForMovie = async ({
    userId,
    votingUserId,
    movieId,
    groupId,
  }: VoteParams) => {
    try {
      await runTransaction(db, async (transaction) => {
        const memberRef = doc(db, `groups/${groupId}/members`, userId);
        const memberSnap = await transaction.get(memberRef);

        const memberData = memberSnap.data();

        const selectedMovies = memberData?.selectedMovies;
        const votesReceived = memberData?.votesReceived;

        const targetMovieIndex = selectedMovies.findIndex(
          (m: MemberType["selectedMovies"][number]) => m.movieId === movieId
        );

        if (targetMovieIndex === -1) {
          throw new Error("Movie not found in user's selection.");
        }

        const targetMovie = selectedMovies[targetMovieIndex];

        targetMovie.totalVotes -= 1;
        targetMovie.votedBy = targetMovie.votedBy.filter(
          (targetUserId: string) => targetUserId !== votingUserId
        );

        if (targetMovie.totalVotes === 0) {
          selectedMovies.splice(targetMovieIndex, 1);
        }

        const userVoteIndex = votesReceived.findIndex(
          (v: MemberType["votesReceived"][number]) =>
            v.votingMember === votingUserId
        );

        if (userVoteIndex === -1) {
          throw new Error("User has no votes to remove");
        }

        const userVote = votesReceived[userVoteIndex];

        userVote.votesCast -= 1;

        // No need to remove userVoteIndex from votesReceived. Users will vote on other movies.

        transaction.set(
          memberRef,
          { selectedMovies, votesReceived },
          { merge: true }
        );
      });
    } catch (error) {
      console.log("Error removing vote: ", error);
      throw new Error("Error removing vote.");
      // Edit later
    }
  };

  // Select movie method

  return (
    <VotingContext.Provider value={{ getVotes, voteForMovie, unvoteForMovie }}>
      {children}
    </VotingContext.Provider>
  );
};
