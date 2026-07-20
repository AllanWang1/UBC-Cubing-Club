export interface AccessRequest {
    user_id: string;
    name: string;
    email: string | null;
    faculty: string;
    birthdate: string | null;
    wca_id: string | null;
}