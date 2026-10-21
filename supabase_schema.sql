-- ========================================================
-- QuestAI: Supabase Database Schema & Initial Data
-- Run this in the Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY, 
	email VARCHAR(255) NOT NULL UNIQUE, 
	hashed_password VARCHAR(255), 
	full_name VARCHAR(255), 
	google_id VARCHAR(255) UNIQUE, 
	profile_picture VARCHAR(1000), 
	auth_provider VARCHAR(50) DEFAULT 'local' NOT NULL, 
	role VARCHAR(50) DEFAULT 'user' NOT NULL, 
	status VARCHAR(50) DEFAULT 'active' NOT NULL, 
	phone_number VARCHAR(50) UNIQUE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS documents (
	id SERIAL PRIMARY KEY, 
	title VARCHAR(255) NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	content TEXT NOT NULL, 
	owner_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE, 
	status VARCHAR(50) DEFAULT 'processing' NOT NULL, 
	error_message TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Password Reset OTPs
CREATE TABLE IF NOT EXISTS password_reset_otps (
	id SERIAL PRIMARY KEY, 
	user_id INTEGER REFERENCES users (id) ON DELETE CASCADE, 
	verification_method VARCHAR(20) DEFAULT 'sms' NOT NULL, 
	phone_number VARCHAR(50), 
	email VARCHAR(255), 
	reference_id VARCHAR(255) NOT NULL UNIQUE, 
	otp_hash VARCHAR(255) NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	attempt_count INTEGER DEFAULT 0 NOT NULL, 
	max_attempts INTEGER DEFAULT 5 NOT NULL, 
	is_used BOOLEAN DEFAULT FALSE NOT NULL, 
	resend_available_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Modules
CREATE TABLE IF NOT EXISTS modules (
	id SERIAL PRIMARY KEY, 
	document_id INTEGER NOT NULL REFERENCES documents (id) ON DELETE CASCADE, 
	title VARCHAR(255) NOT NULL, 
	"order" INTEGER
);

-- 5. Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
	id SERIAL PRIMARY KEY, 
	title VARCHAR(255) NOT NULL, 
	description TEXT, 
	source_type VARCHAR(50) NOT NULL, 
	difficulty VARCHAR(50) NOT NULL, 
	creator_id INTEGER REFERENCES users (id) ON DELETE SET NULL, 
	document_id INTEGER REFERENCES documents (id) ON DELETE SET NULL, 
	status VARCHAR(50) DEFAULT 'completed' NOT NULL, 
	error_message TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Chapters
CREATE TABLE IF NOT EXISTS chapters (
	id SERIAL PRIMARY KEY, 
	document_id INTEGER NOT NULL REFERENCES documents (id) ON DELETE CASCADE, 
	module_id INTEGER REFERENCES modules (id) ON DELETE CASCADE, 
	title VARCHAR(255) NOT NULL, 
	content TEXT, 
	"order" INTEGER
);

-- 7. Questions
CREATE TABLE IF NOT EXISTS questions (
	id SERIAL PRIMARY KEY, 
	quiz_id INTEGER NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE, 
	question_text TEXT NOT NULL, 
	type VARCHAR(50) NOT NULL, 
	explanation TEXT, 
	points INTEGER DEFAULT 1, 
	source_chapter VARCHAR(255), 
	difficulty VARCHAR(50), 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
	id SERIAL PRIMARY KEY, 
	user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE, 
	quiz_id INTEGER NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE, 
	score FLOAT NOT NULL, 
	time_spent INTEGER NOT NULL, 
	completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Options
CREATE TABLE IF NOT EXISTS options (
	id SERIAL PRIMARY KEY, 
	question_id INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE, 
	option_text TEXT NOT NULL, 
	is_correct BOOLEAN NOT NULL
);

-- 10. Topics
CREATE TABLE IF NOT EXISTS topics (
	id SERIAL PRIMARY KEY, 
	chapter_id INTEGER NOT NULL REFERENCES chapters (id) ON DELETE CASCADE, 
	title VARCHAR(255) NOT NULL, 
	"order" INTEGER
);

-- 11. User Answers
CREATE TABLE IF NOT EXISTS user_answers (
	id SERIAL PRIMARY KEY, 
	attempt_id INTEGER NOT NULL REFERENCES quiz_attempts (id) ON DELETE CASCADE, 
	question_id INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE, 
	selected_option_id INTEGER REFERENCES options (id) ON DELETE SET NULL, 
	text_answer TEXT, 
	is_correct BOOLEAN NOT NULL
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_status ON users (status);
CREATE INDEX IF NOT EXISTS ix_users_role ON users (role);
CREATE INDEX IF NOT EXISTS ix_documents_owner_id ON documents (owner_id);
CREATE INDEX IF NOT EXISTS ix_quizzes_creator_id ON quizzes (creator_id);
CREATE INDEX IF NOT EXISTS ix_questions_quiz_id ON questions (quiz_id);
CREATE INDEX IF NOT EXISTS ix_options_question_id ON options (question_id);
CREATE INDEX IF NOT EXISTS ix_quiz_attempts_user_id ON quiz_attempts (user_id);

-- Insert Default Admin User (Password: admin123)
INSERT INTO users (email, hashed_password, full_name, role, status, auth_provider)
VALUES ('admin@questai.com', '$2b$12$jtS/Ii.P6qApLD2vXjE35.DJK3p85qb1JHvTb3RaQAhDpCDzgKeTC', 'System Admin', 'admin', 'active', 'local')
ON CONFLICT (email) DO NOTHING;
