
export enum Role {
    ADMIN = 'admin',
    GURU = 'guru',
    SISWA = 'siswa',
}

export interface User {
    id: number;
    nama: string;
    email: string;
    role: Role;
    kelas_id?: number;
    created_at: string;
}

export interface Kelas {
    id: number;
    nama: string;
    wali_kelas_id: number;
}

export interface Materi {
    id: number;
    kelas_id: number;
    author_id: number;
    judul: string;
    konten_html: string;
    file_url?: string;
    publish_date: string;
}

export enum QuestionType {
    MCQ = 'mcq',
    TRUE_FALSE = 'truefalse',
    ISIAN = 'isian',
    ESAI = 'esai',
}

export enum Difficulty {
    MUDAH = 'mudah',
    SEDANG = 'sedang',
    SULIT = 'sulit',
}

export interface BankSoal {
    id: number;
    mapel: string;
    tipe: QuestionType;
    pertanyaan: string;
    opsi_json?: { value: string, text: string }[];
    kunci_jawaban?: string;
    tingkat_kesulitan: Difficulty;
    created_by: number;
}

export interface Ujian {
    id: number;
    kelas_id: number;
    judul: string;
    deskripsi: string;
    waktu_mulai: string;
    durasi_menit: number;
    aturan_random: boolean;
    author_id: number;
    bank_soal: BankSoal[]; // Changed from soal_ids to hold full question objects
}

export enum AttemptStatus {
    IN_PROGRESS = 'in_progress',
    SUBMITTED = 'submitted',
    GRADED = 'graded'
}

export interface Attempt {
    id: number;
    ujian_id: number;
    user_id: number;
    start_time: string;
    end_time?: string;
    score?: number;
    status: AttemptStatus;
    ujian?: { // For joining data
        judul: string;
    }
}

export interface Jawaban {
    id: number;
    attempt_id: number;
    soal_id: number;
    jawaban_user: string;
    is_correct?: boolean;
    skor?: number;
}

// Navigation types
export type AppView =
    | { type: 'dashboard' }
    | { type: 'classes' }
    | { type: 'questionBank' }
    | { type: 'exams' }
    | { type: 'results' };
