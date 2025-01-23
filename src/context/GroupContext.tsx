import React, { createContext, useContext, useState } from "react";
import { db } from "../utility/Firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { AuthContext } from "./AuthContext";
import GroupType from "../types/GroupType";

export interface GroupContextType {
  groups: Omit<GroupType, "members">[];
  createGroup: (name: string) => Promise<void>;
  addUserToGroup: (
    groupId: string,
    userId: string,
    userRole: "admin" | "mod" | "member"
  ) => Promise<void>;
  getGroupList: (
    userId: string
  ) => Promise<Omit<GroupType, "members">[] | null>;
  getGroup: (groupId: string) => Promise<GroupType | null>;
  verifyGroupMemberList: (groupId: string) => Promise<void>;
  verifyUserGroupList: (userId: string) => Promise<void>;
  removeUserFromGroup: (groupId: string, userId: string) => Promise<void>;
  updateGroup: () => Promise<void>;
  deleteGroup: () => Promise<void>;
}

export const GroupContext = createContext<GroupContextType | null>(null);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [groups, setGroups] = useState<Omit<GroupType, "members">[]>([]);
  const { user } = useContext(AuthContext);
  const currentUserId = user ? user.uid : "";

  const createGroup = async (name: string): Promise<void> => {
    // May eventually change this to GroupType
    try {
      const docRef = await addDoc(collection(db, "groups"), {
        name: name,
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
  ) => {
    const batch = writeBatch(db);

    try {
      const groupMemberRef = doc(db, `groups/${groupId}/members`, userId);
      const userGroupRef = doc(db, `users/${userId}/groupsJoined`, groupId);

      batch.set(groupMemberRef, {
        groupUserName: user?.displayName ? user.displayName : user?.email,
        groupUserRole: userRole,
      });
      batch.set(userGroupRef, {
        name: groupId,
        role: userRole,
      });

      await batch.commit();
    } catch (error) {
      throw new Error("Error adding user to group");
      // Edit this message later.
    }
  };

  const getGroupList = async (
    userId: string
  ): Promise<Omit<GroupType, "members">[] | null> => {
    try {
      const groupsSnap = await getDocs(
        collection(db, `users/${userId}/groupsJoined`)
      );
      const groupList: Omit<GroupType, "members">[] = groupsSnap.docs.map(
        (groupDoc) => {
          const groupData = groupDoc.data();
          return {
            id: groupDoc.id,
            name: groupData.name,
          };
        }
      );
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
              break;
            }
          }
        if (!isGroupInList) {
          console.log(
            `Member ${memberId} does not have this group in their list!`
          );
          const groupInfo = await getGroup(groupId);
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
                break;
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

  const removeUserFromGroup = async (groupId: string, userId: string) => {
    const batch = writeBatch(db);
    try {
      const groupMemberRef = doc(db, `groups/${groupId}/members`, userId);
      const userGroupRef = doc(db, `users/${userId}/groupsJoined`, groupId);

      batch.delete(groupMemberRef);
      batch.delete(userGroupRef);

      await batch.commit();
    } catch (error) {
      throw new Error("Error removing user from group");
      // Edit this message
    }
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
