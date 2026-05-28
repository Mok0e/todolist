-- =============================================
-- Migration 001: 초기 스키마
-- 적용일: 2026-05-28
-- 참조: database/schema.sql
-- =============================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    theme       VARCHAR(10)  NOT NULL DEFAULT 'LIGHT',
    language    VARCHAR(5)   NOT NULL DEFAULT 'ko',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_theme CHECK (theme IN ('LIGHT', 'DARK')),
    CONSTRAINT chk_users_language CHECK (language IN ('ko', 'en'))
);

-- =============================================
-- 2. categories
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    name        VARCHAR(30)  NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
);

-- 카테고리명 대소문자 무구분 유일성 (R-CAT-05)
CREATE UNIQUE INDEX IF NOT EXISTS uk_categories_user_name
    ON categories (user_id, LOWER(name));

-- =============================================
-- 3. todos
-- =============================================
CREATE TABLE IF NOT EXISTS todos (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(100) NOT NULL,
    description  TEXT,
    status       VARCHAR(10),
    start_date   DATE,
    end_date     DATE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_todos PRIMARY KEY (id),
    CONSTRAINT fk_todos_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_todos_category FOREIGN KEY (category_id)
        REFERENCES categories (id),
    -- DB에는 DONE 또는 NULL만 저장 (R-STA-01~04)
    CONSTRAINT chk_todos_status CHECK (status IS NULL OR status = 'DONE'),
    -- 종료일은 시작일 이후여야 함 (R-TODO-02)
    CONSTRAINT chk_todos_dates CHECK (
        end_date IS NULL OR start_date IS NULL OR end_date >= start_date
    )
);

-- =============================================
-- 4. 인덱스 (성능 최적화)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_categories_user_id
    ON categories (user_id);

CREATE INDEX IF NOT EXISTS idx_todos_user_id
    ON todos (user_id);

CREATE INDEX IF NOT EXISTS idx_todos_category_id
    ON todos (category_id);

CREATE INDEX IF NOT EXISTS idx_todos_user_status
    ON todos (user_id, status);

CREATE INDEX IF NOT EXISTS idx_todos_dates
    ON todos (user_id, start_date, end_date);

-- =============================================
-- 5. updated_at 자동 갱신 트리거
-- =============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
