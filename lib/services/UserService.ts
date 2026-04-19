import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/model/user';
import { ApiError } from '@/lib/utils/apiResponse';

export class UserService {
  static async createUser(username: string, name: string, password: string, email: string) {
    try {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        throw new Error('User with this username or name already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async authenticateUser(identifier: string, password: string) {
    try {
      const trimmed = identifier.trim();
      const user = await User.findOne(
        trimmed.includes('@')
          ? { email: trimmed.toLowerCase() }
          : { username: trimmed }
      );

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Return user without password
      const userResponse = user.toObject();
      delete userResponse.password;

      return { user: userResponse, token };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  static async getUserByUsername(username: string) {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        throw new Error('User not found');
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  static async getUserById(userId: string) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  static async updateUserProfile(username: string, updates: { name?: string; dp?: string }) {
    try {
      const user = await User.findOneAndUpdate(
        { username },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async updateUser(
    userId: string,
    updates: {
      name?: string;
      dp?: string;
      currentPassword?: string;
      newPassword?: string;
    }
  ) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const $set: Record<string, unknown> = {};

      if (updates.name !== undefined) {
        $set.name = updates.name;
      }
      if (updates.dp !== undefined) {
        $set.dp = updates.dp;
      }

      if (updates.newPassword && updates.newPassword.length > 0) {
        if (!updates.currentPassword) {
          throw new ApiError('Current password is required to change your password', 400);
        }
        const match = await bcrypt.compare(updates.currentPassword, user.password);
        if (!match) {
          throw new ApiError('Current password is incorrect', 400);
        }
        if (updates.newPassword.length < 6) {
          throw new ApiError('New password must be at least 6 characters', 400);
        }
        $set.password = await bcrypt.hash(updates.newPassword, 12);
      }

      if (Object.keys($set).length === 0) {
        const userResponse = user.toObject();
        delete userResponse.password;
        return userResponse;
      }

      const updated = await User.findByIdAndUpdate(
        userId,
        { $set },
        { new: true, runValidators: true }
      );

      if (!updated) {
        throw new Error('User not found');
      }

      const userResponse = updated.toObject();
      delete userResponse.password;

      return userResponse;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async searchUsers(query: string, currentUser?: string, limit: number = 10) {
    try {
      const regex = new RegExp(query, 'i');

      const conditions: any[] = [
        {
          $or: [
            { username: regex },
            { name: regex }
          ]
        }
      ];

      if (currentUser) {
        conditions.push({ username: { $ne: currentUser } });
      }

      const users = await User.find({
        $and: conditions
      })
      .select('username name dp')
      .limit(limit);

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}