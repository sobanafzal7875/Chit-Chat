import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { GroupService } from '@/lib/services/GroupService';
import { handleApiError, createSuccessResponse } from '@/lib/utils/apiResponse';
import { authenticateUser } from '@/lib/middleware/auth';
import { getIo } from '@/lib/realtime/serverSocket';

export async function PUT(request: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const authResult = await authenticateUser(request);
    if (!authResult.success) return createSuccessResponse({ error: authResult.error }, 401);

    const { name, dp } = await request.json();
    const group = await GroupService.updateGroup(id, authResult.username, { name, dp });
    const io = getIo();
    if (io) {
      io.to(id).emit('group_updated', group);
    }
    return createSuccessResponse({ group });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const authResult = await authenticateUser(request);
    if (!authResult.success) return createSuccessResponse({ error: authResult.error }, 401);

    const { member } = await request.json();
    const targetMember = member || authResult.username;
    const group = await GroupService.removeMember(id, authResult.username, targetMember);
    
    const io = getIo();
    if (io) {
      io.to(targetMember).emit('chat_deleted', { kind: 'group', groupId: id });
      io.to(id).emit('group_updated', group);
    }
    
    return createSuccessResponse({ group });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const authResult = await authenticateUser(request);
    if (!authResult.success) return createSuccessResponse({ error: authResult.error }, 401);

    const { member } = await request.json();
    if (!member) return createSuccessResponse({ error: 'Member is required' }, 400);

    const group = await GroupService.addMemberToGroup(id, authResult.username, member);
    const io = getIo();
    if (io) {
      io.to(id).emit('group_updated', group);
      io.to(member).emit('chat_added', group); // Tell the new member they were added
    }
    return createSuccessResponse({ group });
  } catch (error) {
    return handleApiError(error);
  }
}