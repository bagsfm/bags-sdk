export interface AuthMeTwitterData {
	verified: boolean;
	followers_count: number;
	following_count: number;
	created_at: string;
	url: string;
}

export interface AuthMeUser {
	uuid: string;
	type: string;
	membership: Record<string, unknown>;
	ticker: string;
	username: string;
	status: string;
	pref_name: string;
	picture: string;
	twitter_userID: string;
	registered_at: string;
	profile_views: number;
	invites: number;
	invited_by: string;
	twitter_data: AuthMeTwitterData;
	points: number;
	rank: number;
	referral_count: number;
}

export interface AuthMeResponse {
	user: AuthMeUser;
}
