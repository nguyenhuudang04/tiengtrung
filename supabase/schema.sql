-- Schema for Vocabulary Database
-- NOTE: This is an MVP configuration without Authentication. 
-- RLS policies currently allow public access via anon key. 
-- This must be updated when Auth (đăng nhập) is added.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vocabulary table
CREATE TABLE IF NOT EXISTS public.vocabulary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hanzi TEXT NOT NULL,
    pinyin TEXT NOT NULL,
    meaning_vi TEXT NOT NULL,
    part_of_speech TEXT,
    example_cn TEXT,
    example_pinyin TEXT,
    example_vi TEXT,
    level TEXT,
    category TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unique constraint to prevent duplicate words
-- (hanzi + pinyin + meaning_vi) không được trùng lặp
ALTER TABLE public.vocabulary
ADD CONSTRAINT unique_hanzi_pinyin_meaning UNIQUE (hanzi, pinyin, meaning_vi);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.vocabulary;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- Allow all operations for MVP (anon)
CREATE POLICY "Allow anonymous SELECT" ON public.vocabulary FOR SELECT USING (true);
CREATE POLICY "Allow anonymous INSERT" ON public.vocabulary FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE" ON public.vocabulary FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE" ON public.vocabulary FOR DELETE USING (true);

-- Seed Data (Dữ liệu mẫu)
INSERT INTO public.vocabulary (hanzi, pinyin, meaning_vi, part_of_speech, example_cn, example_pinyin, example_vi, level)
VALUES
('吧', 'ba', 'nhé, nhá', 'Trợ từ', '吃飯吧。', 'Chīfàn ba.', 'Hãy ăn cơm đi.', 'A1'),
('把', 'bǎ', 'cầm, nắm', 'Giới từ', '把書放在桌子上。', 'Bǎ shū fàng zài zhuōzi shàng.', 'Đặt sách lên bàn.', 'A1'),
('八', 'bā', 'tám', 'Số từ', '八本書。', 'Bā běn shū.', 'Tám quyển sách.', 'A1'),
('爸爸', 'bàba', 'bố', 'Danh từ', '我的爸爸很高。', 'Wǒ de bàba hěn gāo.', 'Ba của tôi rất cao.', 'A1'),
('百', 'bǎi', 'trăm', 'Số từ', '一百個人。', 'Yìbǎi ge rén.', 'Một trăm người.', 'A1'),
('百貨公司', 'bǎihuò gōngsī', 'trung tâm thương mại', 'Danh từ', '這家百貨公司很大。', 'Zhè jiā bǎihuò gōngsī hěn dà.', 'Trung tâm thương mại này rất lớn.', 'A1'),
('白色', 'báisè', 'màu trắng', 'Danh từ', '桌子是白色的。', 'Zhuōzi shì báisè de.', 'Cái bàn màu trắng.', 'A1')
ON CONFLICT (hanzi, pinyin, meaning_vi) DO NOTHING;
