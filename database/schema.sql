
-- Source Call Database Schema
-- This file contains the complete database schema for the Source Call app
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE public.chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    avatar_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat participants
CREATE TABLE public.chat_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'annotation', 'ai_analysis')),
    metadata JSONB DEFAULT '{}',
    reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions
CREATE TABLE public.message_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Message read receipts
CREATE TABLE public.message_read_receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- AI annotations table
CREATE TABLE public.ai_annotations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    annotation_type TEXT NOT NULL CHECK (annotation_type IN ('face_detection', 'hand_detection', 'object_detection', 'text_analysis', 'sentiment', 'translation')),
    data JSONB NOT NULL,
    confidence FLOAT,
    model_name TEXT,
    model_version TEXT,
    processing_time INTEGER, -- in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI model usage tracking
CREATE TABLE public.ai_model_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    input_type TEXT,
    processing_time INTEGER, -- in milliseconds
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for analytics
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    device_info JSONB,
    network_info JSONB,
    location_info JSONB,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in milliseconds
    screen_views TEXT[],
    events_count INTEGER DEFAULT 0
);

-- User events for analytics
CREATE TABLE public.user_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    event_name TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security audit log
CREATE TABLE public.security_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('login_success', 'login_failed', 'logout', 'password_change', 'profile_update', 'permission_change')),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads
CREATE TABLE public.file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notification tokens
CREATE TABLE public.push_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    device_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_online ON public.profiles(is_online);
CREATE INDEX idx_profiles_last_seen ON public.profiles(last_seen);

CREATE INDEX idx_chats_type ON public.chats(type);
CREATE INDEX idx_chats_created_by ON public.chats(created_by);
CREATE INDEX idx_chats_created_at ON public.chats(created_at);

CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);

CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_message_type ON public.messages(message_type);

CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON public.message_reactions(user_id);

CREATE INDEX idx_message_read_receipts_message_id ON public.message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user_id ON public.message_read_receipts(user_id);

CREATE INDEX idx_ai_annotations_message_id ON public.ai_annotations(message_id);
CREATE INDEX idx_ai_annotations_user_id ON public.ai_annotations(user_id);
CREATE INDEX idx_ai_annotations_type ON public.ai_annotations(annotation_type);

CREATE INDEX idx_ai_model_usage_user_id ON public.ai_model_usage(user_id);
CREATE INDEX idx_ai_model_usage_model_name ON public.ai_model_usage(model_name);
CREATE INDEX idx_ai_model_usage_created_at ON public.ai_model_usage(created_at);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX idx_user_sessions_start_time ON public.user_sessions(start_time);

CREATE INDEX idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX idx_user_events_session_id ON public.user_events(session_id);
CREATE INDEX idx_user_events_event_name ON public.user_events(event_name);
CREATE INDEX idx_user_events_created_at ON public.user_events(created_at);

CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at);

CREATE INDEX idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX idx_file_uploads_message_id ON public.file_uploads(message_id);

CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX idx_push_tokens_is_active ON public.push_tokens(is_active);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Chats policies
CREATE POLICY "Users can view chats they participate in" ON public.chats
    FOR SELECT USING (
        id IN (
            SELECT chat_id FROM public.chat_participants 
            WHERE user_id = auth.uid() AND left_at IS NULL
        )
    );

CREATE POLICY "Users can create chats" ON public.chats
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat admins can update chats" ON public.chats
    FOR UPDATE USING (
        id IN (
            SELECT chat_id FROM public.chat_participants 
            WHERE user_id = auth.uid() AND role = 'admin' AND left_at IS NULL
        )
    );

-- Chat participants policies
CREATE POLICY "Users can view participants of their chats" ON public.chat_participants
    FOR SELECT USING (
        chat_id IN (
            SELECT chat_id FROM public.chat_participants 
            WHERE user_id = auth.uid() AND left_at IS NULL
        )
    );

CREATE POLICY "Users can join chats" ON public.chat_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave chats" ON public.chat_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their chats" ON public.messages
    FOR SELECT USING (
        chat_id IN (
            SELECT chat_id FROM public.chat_participants 
            WHERE user_id = auth.uid() AND left_at IS NULL
        )
    );

CREATE POLICY "Users can send messages to their chats" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        chat_id IN (
            SELECT chat_id FROM public.chat_participants 
            WHERE user_id = auth.uid() AND left_at IS NULL
        )
    );

CREATE POLICY "Users can update own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Message reactions policies
CREATE POLICY "Users can view reactions in their chats" ON public.message_reactions
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE chat_id IN (
                SELECT chat_id FROM public.chat_participants 
                WHERE user_id = auth.uid() AND left_at IS NULL
            )
        )
    );

CREATE POLICY "Users can add reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON public.message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Message read receipts policies
CREATE POLICY "Users can view read receipts in their chats" ON public.message_read_receipts
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE chat_id IN (
                SELECT chat_id FROM public.chat_participants 
                WHERE user_id = auth.uid() AND left_at IS NULL
            )
        )
    );

CREATE POLICY "Users can mark messages as read" ON public.message_read_receipts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI annotations policies
CREATE POLICY "Users can view annotations in their chats" ON public.ai_annotations
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE chat_id IN (
                SELECT chat_id FROM public.chat_participants 
                WHERE user_id = auth.uid() AND left_at IS NULL
            )
        )
    );

CREATE POLICY "Users can create annotations" ON public.ai_annotations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI model usage policies
CREATE POLICY "Users can view own AI usage" ON public.ai_model_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log own AI usage" ON public.ai_model_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- User events policies
CREATE POLICY "Users can view own events" ON public.user_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events" ON public.user_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security audit log policies (read-only for users)
CREATE POLICY "Users can view own audit logs" ON public.security_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- File uploads policies
CREATE POLICY "Users can view files in their chats" ON public.file_uploads
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM public.messages 
            WHERE chat_id IN (
                SELECT chat_id FROM public.chat_participants 
                WHERE user_id = auth.uid() AND left_at IS NULL
            )
        )
    );

CREATE POLICY "Users can upload files" ON public.file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Push tokens policies
CREATE POLICY "Users can manage own push tokens" ON public.push_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON public.push_tokens
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (user_id, event_type, ip_address, user_agent, details)
    VALUES (p_user_id, p_event_type, p_ip_address, p_user_agent, p_details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get chat participants
CREATE OR REPLACE FUNCTION public.get_chat_participants(p_chat_id UUID)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.user_id,
        p.display_name,
        p.avatar_url,
        cp.role,
        cp.joined_at
    FROM public.chat_participants cp
    JOIN public.profiles p ON cp.user_id = p.id
    WHERE cp.chat_id = p_chat_id AND cp.left_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id UUID, p_chat_id UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
    last_read_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the timestamp of the last message the user read
    SELECT MAX(mrr.read_at) INTO last_read_at
    FROM public.message_read_receipts mrr
    JOIN public.messages m ON mrr.message_id = m.id
    WHERE mrr.user_id = p_user_id AND m.chat_id = p_chat_id;
    
    -- If no read receipts found, consider all messages as unread
    IF last_read_at IS NULL THEN
        SELECT COUNT(*)::INTEGER INTO unread_count
        FROM public.messages
        WHERE chat_id = p_chat_id AND sender_id != p_user_id AND deleted_at IS NULL;
    ELSE
        SELECT COUNT(*)::INTEGER INTO unread_count
        FROM public.messages
        WHERE chat_id = p_chat_id 
        AND sender_id != p_user_id 
        AND created_at > last_read_at 
        AND deleted_at IS NULL;
    END IF;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for chat list with last message and unread count
CREATE OR REPLACE VIEW public.chat_list_view AS
SELECT 
    c.id,
    c.name,
    c.type,
    c.avatar_url,
    c.created_at,
    c.updated_at,
    (
        SELECT json_build_object(
            'id', m.id,
            'content', m.content,
            'message_type', m.message_type,
            'sender_id', m.sender_id,
            'sender_name', p.display_name,
            'created_at', m.created_at
        )
        FROM public.messages m
        LEFT JOIN public.profiles p ON m.sender_id = p.id
        WHERE m.chat_id = c.id AND m.deleted_at IS NULL
        ORDER BY m.created_at DESC
        LIMIT 1
    ) as last_message,
    (
        SELECT COUNT(*)::INTEGER
        FROM public.chat_participants cp
        WHERE cp.chat_id = c.id AND cp.left_at IS NULL
    ) as participant_count
FROM public.chats c
WHERE c.id IN (
    SELECT chat_id 
    FROM public.chat_participants 
    WHERE user_id = auth.uid() AND left_at IS NULL
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insert some sample data for development
INSERT INTO public.profiles (id, email, display_name, bio) VALUES
    ('00000000-0000-0000-0000-000000000001', 'demo@sourcecall.com', 'Demo User', 'This is a demo user for testing Source Call features.'),
    ('00000000-0000-0000-0000-000000000002', 'alice@example.com', 'Alice Johnson', 'AI researcher and developer.'),
    ('00000000-0000-0000-0000-000000000003', 'bob@example.com', 'Bob Smith', 'Mobile app enthusiast.');

-- Create a sample group chat
INSERT INTO public.chats (id, name, type, description, created_by) VALUES
    ('00000000-0000-0000-0000-000000000001', 'AI Development Team', 'group', 'Discussion about AI features and development', '00000000-0000-0000-0000-000000000001');

-- Add participants to the group chat
INSERT INTO public.chat_participants (chat_id, user_id, role) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'member'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'member');

-- Add some sample messages
INSERT INTO public.messages (chat_id, sender_id, content, message_type) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Welcome to Source Call! This app features advanced AI capabilities.', 'text'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'The face detection feature is really impressive!', 'text'),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'I love the gesture control functionality.', 'text');

COMMIT;
