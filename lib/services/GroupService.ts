import Group from '@/model/group';

export class GroupService {
  static async createGroup(groupData: {
    name: string;
    admin: string;
    members: string[];
    dp?: string;
  }) {
    try {
      // Add admin to members if not already included
      if (!groupData.members.includes(groupData.admin)) {
        groupData.members.push(groupData.admin);
      }

      const group = new Group(groupData);
      await group.save();

      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async getUserGroups(username: string) {
    try {
      const groups = await Group.find({
        members: username,
      }).sort({ createdAt: -1 });

      return groups;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  }

  static async getGroupById(groupId: string) {
    try {
      const group = await Group.findById(groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      return group;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  }

  static async addMemberToGroup(groupId: string, memberUsername: string) {
    try {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $addToSet: { members: memberUsername } },
        { new: true }
      );

      if (!group) {
        throw new Error('Group not found');
      }

      return group;
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  }

  static async removeMemberFromGroup(groupId: string, memberUsername: string) {
    try {
      const group = await Group.findByIdAndUpdate(
        groupId,
        { $pull: { members: memberUsername } },
        { new: true }
      );

      if (!group) {
        throw new Error('Group not found');
      }

      return group;
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }
}