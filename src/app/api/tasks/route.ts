import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

async function getSession() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('wingman_session')?.value;
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allTasks = await db.getTasks();
    
    // Admin filter support: if admin passes ?filter=admin_only, return tasks assigned to admin or no one.
    // If user, only return their tasks.
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');

    let tasks = allTasks;

    // Role-based filtering
    if (session.role === 'admin') {
      if (filter === 'admin_only' || filter === 'admin_unassigned') {
        tasks = allTasks.filter(t => t.userId === session.id || !t.userId);
      } else if (filter === 'admin_assigned') {
        tasks = allTasks.filter(t => t.userId !== session.id && t.userId !== null);
      } else if (filter === 'my_tasks') {
        tasks = allTasks.filter(t => t.userId === session.id);
      }
    } else {
      // Normal users only see their own tasks
      tasks = allTasks.filter(t => t.userId === session.id);
    }

    // Date-based filtering
    if (filter === 'today' || filter === 'yesterday' || filter === 'last_week') {
      const now = new Date();
      
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const startOfLastWeek = new Date(startOfToday);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

      tasks = tasks.filter(t => {
        const tDate = new Date(t.createdAt);
        if (filter === 'today') return tDate >= startOfToday;
        if (filter === 'yesterday') return tDate >= startOfYesterday && tDate < startOfToday;
        if (filter === 'last_week') return tDate >= startOfLastWeek && tDate < startOfToday;
        return true;
      });
    }

    // Sort by createdAt descending
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    const task = await db.createTask({
      title: body.title,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      dueDate: body.dueDate || null,
      details: body.details || null,
      userId: body.userId || session.id, // default to self if not provided
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
