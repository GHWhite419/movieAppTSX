import { useState } from "react";
import { db } from "../utility/Firebase";
import {
  doc,
  onSnapshot,
  runTransaction,
  Unsubscribe,
} from "firebase/firestore";
import { MemberType } from "../types/GroupType";

interface VoteParams {
  userId: string;
  votingUserId: string;
  movieId: string;
  groupId: string;
}

const useVoting = () => {
  const [votes, setVotes] = useState<Pick<
    MemberType,
    "selectedMovies" | "votesReceived"
  > | null>(null);

  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

  const subscribeToVotes = (userId: string, groupId: string): void => {
    if (unsubscribe) unsubscribe();

    const memberRef = doc(db, `groups/${groupId}/members`, userId);
    const newUnsubscribe = onSnapshot(memberRef, (snapshot) => {
      if (snapshot.exists()) {
        setVotes({
          selectedMovies: snapshot.data().selectedMovies,
          votesReceived: snapshot.data().votesReceived,
        });
        console.log("Votes:", votes);
      } else setVotes(null);
    });
    setUnsubscribe(() => newUnsubscribe);
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
  return { votes, subscribeToVotes, voteForMovie, unvoteForMovie };
};

export default useVoting;
