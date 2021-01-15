export interface ITweet {
    id_str: string;
    text: string;
    place: any;
    created_at: string;
    user: {
        name: string;
    }
}