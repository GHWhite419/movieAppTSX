import { useState, useContext } from "react";
import { db } from "../utility/Firebase";
import {
  doc,
  onSnapshot,
  runTransaction,
  Unsubscribe,
} from "firebase/firestore";
import { MemberType } from "../types/GroupType";
import { AuthContext } from "../context/AuthContext";

interface VoteParams {
  memberId: string;
  votingMemberId: string;
  movieId: string;
  groupId: string;
}
const useVoting = () => {
  const [votes, setVotes] = useState<Pick<
    MemberType,
    "selectedMovies" | "votesReceived"
  > | null>(null);

  const { user } = useContext(AuthContext);

  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

  const [voteStatus, setVoteStatus] = useState<{
    leadingMovies: string[];
    leadingVotes: number;
    runnerUpVotes: number;
    remainingVotes: number;
  }>({
    leadingMovies: [],
    leadingVotes: 0,
    runnerUpVotes: 0,
    remainingVotes: 0,
  });

  const subscribeToVotes = (memberId: string, groupId: string): void => {
    if (unsubscribe) unsubscribe();

    const memberRef = doc(db, `groups/${groupId}/members`, memberId);
    const newUnsubscribe = onSnapshot(memberRef, (snapshot) => {
      if (snapshot.exists()) {
        setVotes({
          selectedMovies: snapshot.data().selectedMovies,
          votesReceived: snapshot.data().votesReceived,
        });
      } else setVotes(null);
    });
    setUnsubscribe(() => newUnsubscribe);
  };

  const voteForMovie = async ({
    memberId,
    votingMemberId,
    movieId,
    groupId,
  }: VoteParams) => {
    try {
      await runTransaction(db, async (transaction) => {
        const groupRef = doc(db, "groups", groupId);
        const memberRef = doc(db, `groups/${groupId}/members`, memberId);

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
            votedBy: [votingMemberId],
          });
        } else if (!targetMovie.votedBy.includes(votingMemberId)) {
          targetMovie.totalVotes += 1;
          targetMovie.votedBy.push(votingMemberId);
        } else {
          throw new Error("User has already voted for this movie.");
        }

        const userVote = votesReceived.find(
          (v: MemberType["votesReceived"][number]) =>
            v.votingMember === votingMemberId
        );

        if (!userVote) {
          votesReceived.push({ votingMember: votingMemberId, votesCast: 1 });
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
    memberId,
    votingMemberId,
    movieId,
    groupId,
  }: VoteParams) => {
    try {
      await runTransaction(db, async (transaction) => {
        const memberRef = doc(db, `groups/${groupId}/members`, memberId);
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
          (targetMemberId: string) => targetMemberId !== votingMemberId
        );

        if (targetMovie.totalVotes === 0) {
          selectedMovies.splice(targetMovieIndex, 1);
        }

        const userVoteIndex = votesReceived.findIndex(
          (v: MemberType["votesReceived"][number]) =>
            v.votingMember === votingMemberId
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

  const movieVotesReceived = (movieId: string): number => {
    const targetMovieVotes = votes?.selectedMovies.find(
      (targetMovie) => targetMovie.movieId === movieId
    )?.totalVotes;
    if (targetMovieVotes) return targetMovieVotes;
    return 0;
  };

  const userVotesCast: number | undefined = votes?.votesReceived?.find(
    (targetUser) => targetUser.votingMember === user?.uid
  )?.votesCast;

  const isTieBreakNeeded = (
    votesAllowed: number,
    totalVoters: number
  ): boolean => {
    if (!votes?.votesReceived) return false;

    const votesReceived = votes.votesReceived;

    if (voteStatus.leadingMovies.length < 2) return false;

    if (totalVoters === votes.votesReceived.length) {
      const allVotesCast = votesReceived.every(
        (member) => member.votesCast >= votesAllowed
      );
      if (allVotesCast) return true;
    }

    return (
      voteStatus.runnerUpVotes + voteStatus.remainingVotes <
      voteStatus.leadingVotes
    );
  };

  const isVotingDecided = (
    votesAllowed: number,
    totalVoters: number
  ): boolean => {
    if (voteStatus.leadingMovies.length === 0) return false;

    if (totalVoters === votes?.votesReceived.length) {
      const allVotesCast = votes?.votesReceived.every(
        (member) => member.votesCast >= votesAllowed
      );
      if (allVotesCast && voteStatus.leadingMovies.length === 1) return true;
    }

    return (
      voteStatus.leadingMovies.length === 1 &&
      voteStatus.leadingVotes >
        voteStatus.runnerUpVotes + voteStatus.remainingVotes
    );
  };

  const calculateVoteStatus = (votesAllowed: number, totalVoters: number) => {
    if (!votes?.selectedMovies || !votes?.votesReceived) {
      setVoteStatus({
        leadingMovies: [],
        leadingVotes: 0,
        runnerUpVotes: 0,
        remainingVotes: 0,
      });
    } else {
      const voteCounts: Record<string, number> = {};
      for (let movie of votes?.selectedMovies) {
        voteCounts[movie.movieId] = movie.totalVotes || 0;
      }

      const sortedMovies = Object.entries(voteCounts).sort(
        (a, b) => b[1] - a[1]
      );

      if (sortedMovies.length === 0) {
        setVoteStatus({
          leadingMovies: [],
          leadingVotes: 0,
          runnerUpVotes: 0,
          remainingVotes: 0,
        });
        return;
      }

      const leadVotes = sortedMovies[0][1];
      const leadingMoviesList = sortedMovies
        .filter(([_, votes]) => votes === leadVotes)
        .map(([movieId]) => movieId);

      const highestVotes = sortedMovies[0][1];

      const nextHighestVotes =
        sortedMovies.length > leadingMoviesList.length
          ? sortedMovies[leadingMoviesList.length][1]
          : 0;

      let totalRemainingVotes = 0;
      for (let member of votes.votesReceived) {
        totalRemainingVotes += votesAllowed - member.votesCast;
      }

      setVoteStatus({
        leadingMovies: leadingMoviesList,
        leadingVotes: highestVotes,
        runnerUpVotes: nextHighestVotes,
        remainingVotes: totalRemainingVotes,
      });
      if (isVotingDecided(votesAllowed, totalVoters))
        console.log("Movie selected with ID:", voteStatus.leadingMovies[0]);
      // Create "selectMovie" method and call it here.
    }
  };

  return {
    votes,
    voteStatus,
    setVoteStatus,
    subscribeToVotes,
    voteForMovie,
    unvoteForMovie,
    userVotesCast,
    movieVotesReceived,
    isTieBreakNeeded,
    isVotingDecided,
    calculateVoteStatus,
  };
};

export default useVoting;
