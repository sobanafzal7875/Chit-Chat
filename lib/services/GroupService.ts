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

  static async updateGroup(groupId: string, username: string, updates: { name?: string; dp?: string }) {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');

 const isMember = group.members.some((m: any) => 
  String(m) === username || m?.username === username
    );
    if (!isMember) {
      throw new Error('Only members can update group');
    }

  if (updates.name) group.name = updates.name;
  if (updates.dp !== undefined) group.dp = updates.dp;
  await group.save();
  return group;
}

static async removeMember(groupId: string, requester: string, memberToRemove: string) {
  const group = await Group.findById(groupId);
  if (!group) throw new Error('Group not found');

  const adminName = typeof group.admin === 'object' ? (group.admin as any)?.username : group.admin;
  const isAdmin = adminName === requester;
  const isSelf = requester === memberToRemove;
  if (!isAdmin && !isSelf) throw new Error('Unauthorized');

  group.members = group.members.filter((m: any) => 
    String(m) !== memberToRemove && m?.username !== memberToRemove
  );
  await group.save();
  return group;
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

  static async addMemberToGroup(groupId: string, requester: string, memberUsername: string) {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const adminName = typeof group.admin === 'object' ? (group.admin as any)?.username : group.admin;
      if (adminName !== requester) {
        throw new Error('Only admin can add members');
      }

      if (!group.members.includes(memberUsername)) {
        group.members.push(memberUsername);
        await group.save();
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