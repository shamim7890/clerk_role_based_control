// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import supabase from '@/utils/supabase/server'

// GET handler to fetch tasks for the authenticated user
export async function GET(_request: NextRequest) {
  // Get authenticated user from Clerk
  const { userId } = await auth()
  console.log(_request.url)
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST handler to create a new task
export async function POST(request: NextRequest) {
  // Get authenticated user from Clerk
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        name: body.name.trim(),
        user_id: userId
      })
      .select()
    
    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE handler to remove a task
export async function DELETE(request: NextRequest) {
  // Get authenticated user from Clerk
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const url = new URL(request.url)
    const taskId = url.searchParams.get('id')
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}