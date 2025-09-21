
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { useAuth } from './useAuth';

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'video' | 'audio';
  status: 'ringing' | 'active' | 'completed' | 'missed' | 'declined';
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  caller: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    displayName: string;
    avatar?: string;
  };
}

export const useCalls = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  useEffect(() => {
    if (user) {
      loadCalls();
      
      // Set up real-time subscriptions if Supabase is configured
      if (isSupabaseConfigured()) {
        const callsSubscription = supabase
          .channel('calls')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'calls' },
            (payload) => {
              console.log('Call update received:', payload);
              loadCalls(); // Reload calls when any call changes
            }
          )
          .subscribe();

        return () => {
          callsSubscription.unsubscribe();
        };
      }
    }
  }, [user]);

  const loadCalls = async () => {
    if (!user) return;
    
    try {
      console.log('Loading calls...');
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('calls')
          .select(`
            *,
            caller:profiles!calls_caller_id_fkey(*),
            receiver:profiles!calls_receiver_id_fkey(*)
          `)
          .or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('started_at', { ascending: false });

        if (error) {
          console.log('Supabase error loading calls:', error);
          setError('Failed to load calls');
        } else {
          const formattedCalls = (data || []).map(call => ({
            ...call,
            startedAt: new Date(call.started_at),
            endedAt: call.ended_at ? new Date(call.ended_at) : undefined,
          }));
          setCalls(formattedCalls);
          setError(null);
        }
      } else {
        // Fallback to mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockCalls: Call[] = [
          {
            id: 'call_1',
            callerId: 'user_2',
            receiverId: user.id,
            type: 'video',
            status: 'completed',
            startedAt: new Date(Date.now() - 3600000), // 1 hour ago
            endedAt: new Date(Date.now() - 3300000), // 55 minutes ago
            duration: 300, // 5 minutes
            caller: {
              id: 'user_2',
              displayName: 'Alice Johnson',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            },
            receiver: {
              id: user.id,
              displayName: user.displayName,
              avatar: user.avatar,
            },
          },
          {
            id: 'call_2',
            callerId: user.id,
            receiverId: 'user_3',
            type: 'audio',
            status: 'missed',
            startedAt: new Date(Date.now() - 7200000), // 2 hours ago
            caller: {
              id: user.id,
              displayName: user.displayName,
              avatar: user.avatar,
            },
            receiver: {
              id: 'user_3',
              displayName: 'Bob Smith',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            },
          },
        ];
        setCalls(mockCalls);
        setError(null);
      }
    } catch (err) {
      console.log('Error loading calls:', err);
      setError('Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = async (receiverId: string, type: 'video' | 'audio') => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log('Starting call:', { receiverId, type });
      
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('calls')
          .insert([{
            caller_id: user.id,
            receiver_id: receiverId,
            type,
            status: 'ringing',
            started_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (error) {
          console.log('Supabase error starting call:', error);
          return { success: false, error: 'Failed to start call' };
        }

        const newCall: Call = {
          id: data.id,
          callerId: data.caller_id,
          receiverId: data.receiver_id,
          type: data.type,
          status: data.status,
          startedAt: new Date(data.started_at),
          caller: {
            id: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          receiver: {
            id: receiverId,
            displayName: 'Unknown User', // Would be fetched from profiles
          },
        };

        setActiveCall(newCall);
        return { success: true, callId: data.id };
      } else {
        // Fallback to mock behavior
        const newCall: Call = {
          id: 'call_' + Date.now(),
          callerId: user.id,
          receiverId,
          type,
          status: 'ringing',
          startedAt: new Date(),
          caller: {
            id: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          receiver: {
            id: receiverId,
            displayName: 'Demo User',
          },
        };

        setActiveCall(newCall);
        setCalls(prev => [newCall, ...prev]);
        
        // Simulate call progression
        setTimeout(() => {
          setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
        }, 2000);

        return { success: true, callId: newCall.id };
      }
    } catch (err) {
      console.log('Error starting call:', err);
      return { success: false, error: 'Failed to start call' };
    }
  };

  const endCall = async (callId: string) => {
    try {
      console.log('Ending call:', callId);
      
      if (isSupabaseConfigured()) {
        const endTime = new Date().toISOString();
        const { error } = await supabase
          .from('calls')
          .update({
            status: 'completed',
            ended_at: endTime,
          })
          .eq('id', callId);

        if (error) {
          console.log('Supabase error ending call:', error);
          return { success: false, error: 'Failed to end call' };
        }
      } else {
        // Fallback to mock behavior
        setCalls(prev => prev.map(call => 
          call.id === callId 
            ? { 
                ...call, 
                status: 'completed', 
                endedAt: new Date(),
                duration: Math.floor((new Date().getTime() - call.startedAt.getTime()) / 1000)
              }
            : call
        ));
      }

      setActiveCall(null);
      return { success: true };
    } catch (err) {
      console.log('Error ending call:', err);
      return { success: false, error: 'Failed to end call' };
    }
  };

  const answerCall = async (callId: string) => {
    try {
      console.log('Answering call:', callId);
      
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('calls')
          .update({ status: 'active' })
          .eq('id', callId);

        if (error) {
          console.log('Supabase error answering call:', error);
          return { success: false, error: 'Failed to answer call' };
        }
      } else {
        // Fallback to mock behavior
        setCalls(prev => prev.map(call => 
          call.id === callId ? { ...call, status: 'active' } : call
        ));
        
        const call = calls.find(c => c.id === callId);
        if (call) {
          setActiveCall({ ...call, status: 'active' });
        }
      }

      return { success: true };
    } catch (err) {
      console.log('Error answering call:', err);
      return { success: false, error: 'Failed to answer call' };
    }
  };

  const declineCall = async (callId: string) => {
    try {
      console.log('Declining call:', callId);
      
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('calls')
          .update({ 
            status: 'declined',
            ended_at: new Date().toISOString(),
          })
          .eq('id', callId);

        if (error) {
          console.log('Supabase error declining call:', error);
          return { success: false, error: 'Failed to decline call' };
        }
      } else {
        // Fallback to mock behavior
        setCalls(prev => prev.map(call => 
          call.id === callId 
            ? { ...call, status: 'declined', endedAt: new Date() }
            : call
        ));
      }

      setActiveCall(null);
      return { success: true };
    } catch (err) {
      console.log('Error declining call:', err);
      return { success: false, error: 'Failed to decline call' };
    }
  };

  return {
    calls,
    isLoading,
    error,
    activeCall,
    startCall,
    endCall,
    answerCall,
    declineCall,
    loadCalls,
    isSupabaseConfigured: isSupabaseConfigured(),
  };
};
