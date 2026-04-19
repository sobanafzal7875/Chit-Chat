import Message from '@/model/message';

export class MessageService {
  static toPublicMessage(doc: unknown) {
    const o = (
      doc && typeof doc === 'object' && 'toObject' in doc && typeof (doc as { toObject: () => object }).toObject === 'function'
        ? (doc as { toObject: () => object }).toObject()
        : doc
    ) as Record<string, unknown>;
    if (o.unsent) {
      return {
        ...o,
        content: '',
        fileUrl: undefined,
        fileType: undefined,
        unsent: true,
      };
    }
    return o;
  }

  static async createMessage(messageData: {
    content: string;
    sender: string;
    receiver?: string;
    groupId?: string;
    fileUrl?: string;
    fileType?: string;
  }) {
    try {
      const message = new Message(messageData);
      await message.save();
      await message.populate('sender', 'username name dp');

      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async sendDirectMessage(
    senderUsername: string,
    receiverUsername: string,
    content: string,
    fileUrl?: string,
    fileType?: string
  ) {
    return this.createMessage({
      content: content ?? '',
      sender: senderUsername,
      receiver: receiverUsername,
      fileUrl,
      fileType,
    });
  }

  static async sendGroupMessage(
    senderUsername: string,
    groupId: string,
    content: string,
    fileUrl?: string,
    fileType?: string
  ) {
    return this.createMessage({
      content: content ?? '',
      sender: senderUsername,
      groupId,
      fileUrl,
      fileType,
    });
  }

  static async getMessagesBetweenUsers(user1: string, user2: string, limit: number = 50) {
    try {
      const messages = await Message.find({
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 }
        ],
        groupId: { $exists: false }
      })
      .populate('sender', 'username name dp')
      .sort({ createdAt: 1 })
      .limit(limit);

      return messages.map((m) => MessageService.toPublicMessage(m));
    } catch (error) {
      console.error('Error fetching messages between users:', error);
      throw error;
    }
  }

  static async getGroupMessages(groupId: string, limit: number = 50) {
    try {
      const messages = await Message.find({ groupId })
        .populate('sender', 'username name dp')
        .sort({ createdAt: 1 })
        .limit(limit);

      return messages.map((m) => MessageService.toPublicMessage(m));
    } catch (error) {
      console.error('Error fetching group messages:', error);
      throw error;
    }
  }

  static async markMessagesAsRead(sender: string, receiver: string) {
    try {
      await Message.updateMany(
        { sender, receiver, read: false },
        { $set: { read: true } }
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /** Marks messages sent by `otherUsername` to `currentUsername` as read. */
  static async markDirectMessagesAsRead(currentUsername: string, otherUsername: string) {
    try {
      await Message.updateMany(
        {
          sender: otherUsername,
          receiver: currentUsername,
          read: false,
        },
        { $set: { read: true } }
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking direct messages as read:', error);
      throw error;
    }
  }

  static async markGroupMessagesAsRead(groupId: string, userId: string) {
    try {
      // For group messages, we don't mark them as read since they're visible to all
      // But we could implement a read receipt system later
      return { success: true };
    } catch (error) {
      console.error('Error marking group messages as read:', error);
      throw error;
    }
  }

  static async unsendMessage(messageId: string, requesterUsername: string) {
    const msg = await Message.findById(messageId);
    if (!msg) {
      throw new Error('Message not found');
    }
    if (msg.unsent) {
      return MessageService.toPublicMessage(msg);
    }
    const raw = msg.sender as unknown;
    const senderName =
      typeof raw === 'string'
        ? raw
        : raw && typeof raw === 'object' && 'username' in raw
          ? String((raw as { username: string }).username)
          : '';
    if (!senderName || senderName !== requesterUsername) {
      throw new Error('Unauthorized');
    }
    msg.unsent = true;
    msg.content = '';
    msg.fileUrl = undefined;
    msg.fileType = undefined;
    await msg.save();
    return MessageService.toPublicMessage(msg);
  }

  static async getUnreadCount(username: string) {
    try {
      const unreadCount = await Message.countDocuments({
        receiver: username,
        read: false
      });

      return unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}