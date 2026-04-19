import Message from '@/model/message';
import Group from '@/model/group';

export class ChatService {
  static async getUserChats(username: string) {
    try {
      // Get individual chats (latest message with each user)
      const individualChats = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: username },
              { receiver: username }
            ],
            groupId: { $exists: false }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ['$sender', username] },
                then: '$receiver',
                else: '$sender'
              }
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiver', username] },
                      { $eq: ['$read', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'username',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            id: '$_id',
            username: '$_id',
            name: '$user.name',
            dp: '$user.dp',
            lastMessage: 1,
            unreadCount: 1,
            isGroup: { $literal: false }
          }
        }
      ]);

      // Get group chats
      const groupChats = await Group.aggregate([
        {
          $match: { members: username }
        },
        {
          $lookup: {
            from: 'messages',
            localField: '_id',
            foreignField: 'groupId',
            as: 'messages'
          }
        },
        {
          $addFields: {
            lastMessage: { $arrayElemAt: [{ $sortArray: { input: '$messages', sortBy: { createdAt: -1 } } }, 0] },
            unreadCount: {
              $size: {
                $filter: {
                  input: '$messages',
                  cond: {
                    $and: [
                      { $ne: ['$$this.sender', username] },
                      { $eq: ['$$this.read', false] }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'admin',
            foreignField: 'username',
            as: 'admin',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'members',
            foreignField: 'username',
            as: 'memberDetails',
          },
        },
        {
          $project: {
            id: '$_id',
            name: 1,
            admin: { $arrayElemAt: ['$admin', 0] },
            members: '$memberDetails',
            lastMessage: 1,
            unreadCount: 1,
            isGroup: { $literal: true },
            createdAt: 1,
          },
        }
      ]);

      // Combine and sort by last message time
      const allChats = [...individualChats, ...groupChats]
        .filter(chat => chat.lastMessage) // Only include chats with messages
        .sort((a, b) => {
          const timeA = new Date(a.lastMessage.createdAt).getTime();
          const timeB = new Date(b.lastMessage.createdAt).getTime();
          return timeB - timeA;
        });

      return allChats;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  }

  static async getChatUnreadCount(username: string) {
    try {
      const totalUnread = await Message.countDocuments({
        receiver: username,
        read: false,
        groupId: { $exists: false }
      });

      // For groups, we need to count unread messages where sender is not the current user
      const groupUnread = await Message.countDocuments({
        groupId: { $exists: true },
        sender: { $ne: username },
        read: false
      });

      return totalUnread + groupUnread;
    } catch (error) {
      console.error('Error getting chat unread count:', error);
      throw error;
    }
  }

  static async deleteDirectConversation(username: string, otherUsername: string) {
    const result = await Message.deleteMany({
      groupId: { $exists: false },
      $or: [
        { sender: username, receiver: otherUsername },
        { sender: otherUsername, receiver: username },
      ],
    });
    return { deletedCount: result.deletedCount ?? 0 };
  }

  static async deleteGroupConversation(groupId: string, username: string) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    if (!group.members.includes(username)) {
      throw new Error('Not a member of this group');
    }
    const result = await Message.deleteMany({ groupId });
    return {
      deletedCount: result.deletedCount ?? 0,
      memberUsernames: [...group.members] as string[],
    };
  }
}