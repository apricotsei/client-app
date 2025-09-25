/**
 * usersテーブルのレコードに対応する型
 */
export interface User {
    id: string;
    email: string;
    password_hash: string;
    full_name: string;
    created_at?: string;
    date_of_birth?: string | null;
    address?: string | null;
    height?: number | null;
    weight?: number | null;
    goal?: string | null;
    role?: 'customer' | string;
    plan_name?: string | null;
    remaining_sessions?: number | null;
}

/**
 * trainersテーブルのレコードに対応する型
 */
export interface Trainer {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * shiftsテーブルのステータス
 */
export type ShiftStatus = 'pending' | 'confirmed' | 'cancelled';

/**
 * shiftsテーブルのレコードに対応する型
 */
export interface Shift {
    id: number;
    trainer_id: number;
    start_time: string; // サーバーとクライアント間での受け渡しのためstring型
    end_time: string;
    status: ShiftStatus;
    created_at?: string;
    updated_at?: string;
}

/**
 * bookingsテーブルのステータス
 */
export type BookingStatus = 'confirmed' | 'cancelled';

/**
 * bookingsテーブルのレコードに対応する型
 */
export interface Booking {
    id: number;
    shift_id: number;
    customer_id: string;
    session_start_time: string; // サーバーとクライアント間での受け渡しのためstring型
    session_end_time: string;
    status: BookingStatus;
    created_at?: string;
    updated_at?: string;
}