export interface AccessRequest {
    user_id: string;
    name: string;
    email: string | null;
    faculty: string;
    student_id: string | null;
    birthdate: string | null;
    wca_id: string | null;
}