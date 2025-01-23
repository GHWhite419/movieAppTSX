import React, { createContext } from "react";
import { db } from "../utility/Firebase";
import {
  doc,
  getDocs,
  query,
  collection,
  // setDoc, updateDoc
  runTransaction,
} from "firebase/firestore";

export interface VotingContextType {
  getVotes: (userId: string, groupId: string) => Promise<void>;
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
  const getVotes = async (userId: string, groupId: string) => {
    // Fetch votes from database
    try {
      const voteQuery = query(
        collection(db, `groups/${groupId}/members/${userId}`)
      );

      const querySnapshot = await getDocs(voteQuery);
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });
    } catch {
      throw new Error("Error getting votes.");
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
          : { selectedMovies: {}, votesReceived: {} };

        const groupData = groupSnap.data();
        const votesAllowed = groupData?.votesAllowed ?? 2;

        const selectedMovies = memberData.selectedMovies || {};
        const votesReceived = memberData.votesReceived || {};

        if (!selectedMovies[movieId]) {
          selectedMovies[movieId] = { votes: 1, votedBy: [votingUserId] };
        } else if (!selectedMovies[movieId].votedBy.includes(votingUserId)) {
          selectedMovies[movieId].votes += 1;
          selectedMovies[movieId].votedBy.push(votingUserId);
        } else {
          throw new Error("User has already voted for this movie.");
        }

        const userVotes = votesReceived[votingUserId] || 0;
        if (userVotes >= votesAllowed) {
          throw new Error("Vote limit reached for this user.");
        }
        votesReceived[votingUserId] = userVotes + 1;

        transaction.set(
          memberRef,
          { selectedMovies, votesReceived },
          { merge: true }
        );
      });
    } catch {
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

        selectedMovies[movieId].votes -= 1;
        selectedMovies[movieId].votedBy = selectedMovies[
          movieId
        ].votedBy.filter(
          (targetUserId: string) => targetUserId !== votingUserId
        );

        if (selectedMovies[movieId].votes === 0) {
          delete selectedMovies[movieId];
        }

        const userVotes = votesReceived[votingUserId];

        votesReceived[votingUserId] = userVotes - 1;

        transaction.set(
          memberRef,
          { selectedMovies, votesReceived },
          { merge: true }
        );
      });
    } catch {
      throw new Error("Error removing vote.");
      // Edit later
    }
  };

  // Tiebreak method

  return (
    <VotingContext.Provider value={{ getVotes, voteForMovie, unvoteForMovie }}>
      {children}
    </VotingContext.Provider>
  );
};
