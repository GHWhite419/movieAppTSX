export interface GroupType {
  id: string;
  name: string;
  members: MemberType[];
  //   Wonder if I should import AuthContext User and make this an array of users.

  // dateCreated: Date()
  //   Need to think what other properties I'll need. Might not know until later when I start creating components.
  //   -Possibly an image property, displaying group's logo
  options: OptionsType;
}

export interface MemberType {
  groupUserId: string;
  groupUserName: string;
  groupUserRole: "admin" | "mod" | "member";
  selectedMovies: {
    movieId: string;
    totalVotes: number;
    votedBy: string[];
  }[];
  votesReceived: {
    votingMember: string;
    votesCast: number;
  }[];
}

export interface OptionsType {
  votesAllowed: number;
  // Other stuff
}
// Should this be a subcollection or a document?
