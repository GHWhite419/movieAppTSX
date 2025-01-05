import React, { createContext, useContext, useState } from "react";
import { db } from "../firebase/Firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { AuthContext } from "../firebase/AuthContext";
import GroupType from "../types/GroupType";

export interface GroupContextType {
  groups: GroupType[];
  createGroup: (name: string) => Promise<void>;
  addUserToGroup: (
    groupId: string,
    userId: string,
    userRole: "admin" | "mod" | "member"
  ) => Promise<void>;
  getGroupList: (userId: string) => Promise<GroupType[] | null>;
  getGroup: (groupId: string) => Promise<GroupType | null>;
  verifyGroupMemberList: (groupId: string) => Promise<void>;
  verifyUserGroupList: (userId: string) => Promise<void>;
  removeUserFromGroup: () => Promise<void>;
  updateGroup: () => Promise<void>;
  deleteGroup: () => Promise<void>;
}

export const GroupContext = createContext<GroupContextType | null>(null);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const { user } = useContext(AuthContext);
  const currentUserId = user ? user.uid : "";

  const createGroup = async (name: string): Promise<void> => {
    // May eventually change this to GroupType
    try {
      const docRef = await addDoc(collection(db, "groups"), {
        name: name,
        // members: [{}],
      });
      //   Need to somehow retrieve the group's new id.
      addUserToGroup(docRef.id, currentUserId, "admin");
    } catch (error) {
      throw new Error("Error creating group.");
      // Edit this message later.
    }
  };

  const addUserToGroup = async (
    groupId: string,
    userId: string,
    userRole: "admin" | "mod" | "member"
  ): Promise<void> => {
    // I also want to add the group to the user's groupsJoined list, with id and name.
    const groupRef = doc(db, `groups/${groupId}`);
    const groupDoc = await getDoc(groupRef);
    if (!groupDoc.exists()) {
      throw new Error("Error adding user to group. Group not found.");
    }

    const groupData = groupDoc.data();

    try {
      //   await addDoc(collection(db, `${groupId}/members/${currentUserId}`), {
      //     groupUserId: userId,
      //     groupUserName: user?.displayName ? user.displayName : user?.email,
      //     groupUserRole: userRole,
      //   });

      await setDoc(
        doc(db, `groups/${groupId}/members/`, userId),
        {
          groupUserName: user?.displayName ? user.displayName : user?.email,
          groupUserRole: userRole,
        },
        { merge: true }
      );

      await setDoc(
        doc(db, `users/${userId}/groupsJoined/`, groupId),
        {
          name: groupData.name,
          role: userRole,
        },
        { merge: true }
      );
    } catch (error) {
      throw new Error("Error adding user to group");
      // Edit this message later.
    }
    console.log("User added to group: ", userId);
  };

  const getGroupList = async (userId: string): Promise<GroupType[] | null> => {
    try {
      const groupsSnap = await getDocs(
        collection(db, `users/${userId}/groupsJoined`)
      );
      const groupList: GroupType[] = groupsSnap.docs.map((groupDoc) => {
        const groupData = groupDoc.data();
        return {
          id: groupDoc.id,
          name: groupData.name,
          members: groupData.members,
        };
      });
      setGroups(groupList);
      return groupList;
    } catch (error) {
      console.error("Error fetching group list:", error);
      return null;
      // Edit this message later.
    }
  };

  const getGroup = async (groupId: string): Promise<GroupType | null> => {
    const docRef = doc(db, `groups`, groupId);
    try {
      const docSnap = await getDoc(docRef);
      const groupData = docSnap.data() as GroupType;
      // Type assertions are gross

      const membersSnap = await getDocs(
        collection(db, `groups/${groupId}/members`)
      );

      const members = membersSnap.docs.map((memberDoc) => {
        const memberData = memberDoc.data();
        return {
          groupUserId: memberDoc.id,
          groupUserName: memberData.groupUserName,
          groupUserRole: memberData.groupUserRole,
        };
      });
      // verifyMemberList(groupId);
      return {
        id: docSnap.id,
        name: groupData.name,
        members,
      };
    } catch (error) {
      console.log("Error finding group with ID:", groupId);
      throw new Error("Group not found!");
      // Modify error message down the road.
    }
  };

  const verifyGroupMemberList = async (groupId: string): Promise<void> => {
    //  Add an over-arching try-catch block
    console.log("Verifying member list...");
    try {
      const membersSnap = await getDocs(
        collection(db, `groups/${groupId}/members`)
      );

      const memberList = membersSnap.docs.map((memberDoc) => {
        return memberDoc.id;
      });

      for (let memberId of memberList) {
        const groupList = await getGroupList(memberId);

        let isGroupInList = false;
        if (groupList)
          for (let targetGroup of groupList) {
            if (targetGroup.id === groupId) {
              isGroupInList = true;
              console.log(`Member ${memberId} has this group in their list!`);
            }
          }
        if (!isGroupInList) {
          console.log(
            `Member ${memberId} does not have this group in their list!`
          );
          const groupInfo = await getGroup(groupId);
          console.log(groupInfo);
          try {
            await setDoc(
              doc(db, `users/${memberId}/groupsJoined/`, groupId),
              {
                name: groupInfo?.name,
                role: "member",
              },
              { merge: true }
            );
            console.log(
              `Group ${groupId} successfully added to member ${memberId}'s list!`
            );
          } catch (error) {
            throw new Error("Error adding group to member's list");
            //  Edit this message later.
          }
        }
      }
      console.log("Member list successfully verified!");
    } catch (error) {
      throw new Error("Error verifying member list");
    }
  };

  const verifyUserGroupList = async (userId: string): Promise<void> => {
    //  Add an over-arching try-catch block
    console.log("Verifying group list...");
    try {
      const groupList = await getGroupList(userId);
      if (groupList) {
        for (let group of groupList) {
          const groupInfo = await getGroup(group.id);
          const memberList = groupInfo?.members;

          let isMemberInList = false;
          if (memberList)
            for (let member of memberList) {
              if (member.groupUserId === userId) {
                isMemberInList = true;
                console.log(`Group ${group.id} has this user in its list!`);
              }
            }
          if (!isMemberInList) {
            console.log(
              `Group ${group.id} does not have this user in its list!`
            );
            try {
              await setDoc(
                doc(db, `groups/${group.id}/members/`, userId),
                {
                  groupUserName: user?.displayName
                    ? user.displayName
                    : user?.email,
                  groupUserRole: "member",
                },
                { merge: true }
              );
              console.log(
                `User ${userId} successfully added to group ${group.id}'s list!`
              );
            } catch (error) {
              throw new Error("Error adding user to group's list");
              //  Edit this message later.
            }
          }
        }
      }
      console.log("Group list verified!");
    } catch (error) {
      throw new Error("Error verifying group list");
    }
  };

  const removeUserFromGroup = async (): Promise<void> => {
    console.log("User removed from group");
  };

  const updateGroup = async (): Promise<void> => {
    console.log("Group updated");
  };

  const deleteGroup = async (): Promise<void> => {
    console.log("Group deleted");
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        createGroup,
        addUserToGroup,
        removeUserFromGroup,
        updateGroup,
        deleteGroup,
        getGroupList,
        getGroup,
        verifyGroupMemberList,
        verifyUserGroupList,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
