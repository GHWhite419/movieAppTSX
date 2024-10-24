// import { useContext } from "react";
// import { AuthContext } from "../firebase/AuthContext";

// const { user } = useContext(AuthContext);

interface GroupType {
  id: string;
  name: string;
  members: [
    {
      groupUserId: string;
      groupUserName: string;
      groupUserRole: 'admin' | 'mod' | 'member';
      // groupUserRole: 0 | 1 | 2;
      // Wonder what type is better to reprseent a user's role.
    }
  ];
  //   Wonder if I should import AuthContext User and make this an array of users.
  //   Need to think what other properties I'll need. Might not know until later when I start creating components.
  //   -Possibly an image property, displaying group's logo
}

export default GroupType;
