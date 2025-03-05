import { useState, useContext, useEffect, useRef } from "react";
import { db } from "../utility/Firebase";
import {
  doc,
  onSnapshot,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  runTransaction,
  Unsubscribe,
} from "firebase/firestore";
import { MemberType } from "../types/GroupType";
import { AuthContext } from "../context/AuthContext";

interface VoteParams {
  memberId: string;
  voterId: string;
  movieId: string;
  groupId: string;
}

const useVoting = () => {
  const { user } = useContext(AuthContext);

  const [unsubscribe, setUnsubscribe] = useState<{
    groupUnsubscribe: Unsubscribe | null;
    memberUnsubscribe: Unsubscribe | null;
  }>({
    groupUnsubscribe: null,
    memberUnsubscribe: null,
  });

  const [votes, setVotes] = useState<Pick<
    MemberType,
    "selectedMovies" | "votesReceived"
  > | null>(null);

  const [voteResults, setVoteResults] = useState<{
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

  const [voteConfig, setVoteConfig] = useState<{
    memberId: string;
    groupId: string;
    votesAllowed: number;
    totalVoters: number;
  }>({
    memberId: "",
    groupId: "",
    votesAllowed: 0,
    totalVoters: 0,
  });

  const [selectedMovie, setSelectedMovie] = useState<string>("");

  const prevSelectedMovieRef = useRef<string>("");

  useEffect(() => {
    if (!voteResults.leadingMovies.length) return;

    console.log("Checking for voting status changes...");

    const prevSelectedMovie = prevSelectedMovieRef.current;

    if (
      isVotingDecided(voteConfig.votesAllowed, voteConfig.totalVoters) &&
      !selectedMovie
    ) {
      console.log("Selecting winning movie...");
      const winningMovie = voteResults.leadingMovies[0];
      selectWinningMovie(
        voteConfig.memberId,
        voteResults.leadingMovies[0],
        voteConfig.groupId
      ).then(() => {
        setSelectedMovie(winningMovie);
        prevSelectedMovieRef.current = winningMovie;
      });
    } else if (
      !isVotingDecided(voteConfig.votesAllowed, voteConfig.totalVoters) &&
      selectedMovie
    ) {
      console.log("Deselecting winning movie...");
      deselectWinningMovie(voteConfig.memberId, voteConfig.groupId).then(() => {
        setSelectedMovie("");
        prevSelectedMovieRef.current = "";
      });
    } else if (prevSelectedMovie !== selectedMovie) {
      prevSelectedMovieRef.current = selectedMovie;
    }
  }, [voteResults]);

  const subscribeToVotes = (memberId: string, groupId: string): void => {
    if (!voteConfig.memberId || !voteConfig.groupId) {
      console.error("Skipping subscribeToVotes due to missing values:", {
        memberId,
        groupId,
      });
      return;
    }

    unsubscribe.groupUnsubscribe?.();
    unsubscribe.memberUnsubscribe?.();

    const groupRef = doc(db, `groups/${groupId}`);
    const groupUnsubscribe = onSnapshot(groupRef, (snapshot) => {
      if (snapshot.exists()) {
        const updatedVotesAllowed = snapshot.data().options.votesAllowed;
        let updatedTotalVoters: number;

        const membersRef = collection(db, `groups/${groupId}/members`);
        getDocs(membersRef).then((membersSnapshot) => {
          updatedTotalVoters = membersSnapshot.size - 1;

          setVoteConfig((prevState) => ({
            ...prevState,
            votesAlowed: updatedVotesAllowed,
            totalVoters: updatedTotalVoters,
          }));
        });

        const targetMemberRef = doc(db, `groups/${groupId}/members`, memberId);
        const memberUnsubscribe = onSnapshot(targetMemberRef, (snapshot) => {
          if (snapshot.exists()) {
            const updatedVotes = {
              selectedMovies: snapshot.data().selectedMovies,
              votesReceived: snapshot.data().votesReceived,
            };

            setVotes(updatedVotes);

            calculateVoteStatus(updatedVotesAllowed, updatedVotes);
          } else setVotes(null);
        });
        setUnsubscribe({
          groupUnsubscribe,
          memberUnsubscribe,
        });
      }
    });
  };

  const voteForMovie = async ({
    memberId,
    voterId,
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
            votedBy: [voterId],
          });
        } else if (!targetMovie.votedBy.includes(voterId)) {
          targetMovie.totalVotes += 1;
          targetMovie.votedBy.push(voterId);
        } else {
          throw new Error("User has already voted for this movie.");
        }

        const userVote = votesReceived.find(
          (v: MemberType["votesReceived"][number]) => v.votingMember === voterId
        );

        if (!userVote) {
          votesReceived.push({ votingMember: voterId, votesCast: 1 });
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
    voterId,
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
          (targetMemberId: string) => targetMemberId !== voterId
        );

        if (targetMovie.totalVotes === 0) {
          selectedMovies.splice(targetMovieIndex, 1);
        }

        const userVoteIndex = votesReceived.findIndex(
          (v: MemberType["votesReceived"][number]) => v.votingMember === voterId
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

    if (voteResults.leadingMovies.length < 2) return false;

    if (totalVoters === votes.votesReceived.length) {
      const allVotesCast = votesReceived.every(
        (member) => member.votesCast >= votesAllowed
      );
      if (allVotesCast) return true;
    }

    return (
      voteResults.runnerUpVotes + voteResults.remainingVotes <
      voteResults.leadingVotes
    );
  };

  const isVotingDecided = (
    votesAllowed: number,
    totalVoters: number
  ): boolean => {
    if (voteResults.leadingMovies.length !== 1) {
      return false;
    }

    if (totalVoters === votes?.votesReceived.length) {
      const allVotesCast = votes?.votesReceived.every(
        (member) => member.votesCast >= votesAllowed
      );
      if (allVotesCast && voteResults.leadingMovies.length === 1) {
        return true;
      }
    }

    return (
      voteResults.leadingMovies.length === 1 &&
      voteResults.leadingVotes >
        voteResults.runnerUpVotes + voteResults.remainingVotes
    );
  };

  const calculateVoteStatus = (
    votesAllowed: number,
    updatedVotes: Pick<MemberType, "selectedMovies" | "votesReceived">
  ) => {
    if (!updatedVotes) {
      setVoteResults({
        leadingMovies: [],
        leadingVotes: 0,
        runnerUpVotes: 0,
        remainingVotes: 0,
      });
    } else {
      const voteCounts: Record<string, number> = {};
      for (let movie of updatedVotes.selectedMovies) {
        voteCounts[movie.movieId] = movie.totalVotes || 0;
      }

      const sortedMovies = Object.entries(voteCounts).sort(
        (a, b) => b[1] - a[1]
      );

      if (sortedMovies.length === 0) {
        setVoteResults({
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
      for (let member of updatedVotes.votesReceived) {
        totalRemainingVotes += votesAllowed - member.votesCast;
      }
      setVoteResults({
        leadingMovies: leadingMoviesList,
        leadingVotes: highestVotes,
        runnerUpVotes: nextHighestVotes,
        remainingVotes: totalRemainingVotes,
      });
    }
  };

  const selectWinningMovie = async (
    memberId: string,
    movieId: string,
    groupId: string
  ) => {
    const docRef = doc(db, `groups/${groupId}/members/${memberId}`);

    // When state is altered up here we have an infinite loop.
    try {
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data();

      if (docData) {
        const isAlreadySelected = docData.selectedMovies.some(
          (movie: { movieId: string; isSelectedMovie?: boolean }) =>
            movie.movieId === movieId && movie.isSelectedMovie
        );

        if (isAlreadySelected) {
          return;
        }

        const updatedMovies = docData.selectedMovies.map(
          (movie: {
            movieId: string;
            totalVotes: number;
            votedBy: string[];
            isSelectedMovie?: boolean;
          }) =>
            movie.movieId === movieId
              ? { ...movie, isSelectedMovie: true }
              : movie
        );

        await updateDoc(docRef, {
          selectedMovies: updatedMovies,
        });
        console.log("Movie successfully selected.");
      }
    } catch (error) {
      console.log("Error confirming winning movie:", error);
    }
  };

  const deselectWinningMovie = async (memberId: string, groupId: string) => {
    if (!memberId || !groupId) {
      console.error("Skipping deselectWinningMovie due to missing values:");
    }
    const docRef = doc(db, `groups/${groupId}/members/${memberId}`);
    try {
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data();

      if (docData) {
        const updatedMovies = docData.selectedMovies.map(
          (movie: {
            movieId: string;
            totalVotes: number;
            votedBy: string[];
            isSelectedMovie?: boolean;
          }) => {
            if (movie.isSelectedMovie) {
              const { isSelectedMovie, ...rest } = movie;
              return rest;
            }
            return movie;
          }
        );

        await updateDoc(docRef, {
          selectedMovies: updatedMovies,
        });
      }
    } catch (error) {
      console.log("Error deselecting winning movie:", error);
    }
  };

  return {
    votes,
    voteConfig,
    setVoteConfig,
    subscribeToVotes,
    voteForMovie,
    unvoteForMovie,
    movieVotesReceived,
    userVotesCast,
    isTieBreakNeeded,
    isVotingDecided,
  };
};

export default useVoting;
