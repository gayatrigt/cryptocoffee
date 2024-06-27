export interface Root {
    conversation: Conversation
    next: Next
}

export interface Conversation {
    cast: Cast
}

export interface Cast {
    object: string
    hash: string
    thread_hash: string
    parent_hash: any
    parent_url: string
    root_parent_url: string
    parent_author: ParentAuthor
    author: Author
    text: string
    timestamp: string
    embeds: Embed[]
    reactions: Reactions
    replies: Replies
    channel: Channel
    mentioned_profiles: any[]
    viewer_context: ViewerContext2
    direct_replies: DirectReply[]
}

export interface ParentAuthor {
    fid: any
}

export interface Author {
    object: string
    fid: number
    custody_address: string
    username: string
    display_name: string
    pfp_url: string
    profile: Profile
    follower_count: number
    following_count: number
    verifications: string[]
    verified_addresses: VerifiedAddresses
    active_status: string
    power_badge: boolean
    viewer_context: ViewerContext
}

export interface Profile {
    bio: Bio
}

export interface Bio {
    text: string
}

export interface VerifiedAddresses {
    eth_addresses: string[]
    sol_addresses: any[]
}

export interface ViewerContext {
    following: boolean
    followed_by: boolean
}

export interface Embed {
    url: string
}

export interface Reactions {
    likes_count: number
    recasts_count: number
    likes: Like[]
    recasts: Recast[]
}

export interface Like {
    fid: number
    fname: string
}

export interface Recast {
    fid: number
    fname: string
}

export interface Replies {
    count: number
}

export interface Channel {
    object: string
    id: string
    name: string
    image_url: string
}

export interface ViewerContext2 {
    liked: boolean
    recasted: boolean
}

export interface DirectReply {
    object: string
    hash: string
    thread_hash: string
    parent_hash: string
    parent_url: any
    root_parent_url: string
    parent_author: ParentAuthor2
    author: Author2
    text: string
    timestamp: string
    embeds: Embed2[]
    reactions: Reactions2
    replies: Replies2
    channel: Channel2
    mentioned_profiles: MentionedProfile[]
    viewer_context: ViewerContext4
    direct_replies: any[]
}

export interface ParentAuthor2 {
    fid: number
}

export interface Author2 {
    object: string
    fid: number
    custody_address: string
    username: string
    display_name: string
    pfp_url: string
    profile: Profile2
    follower_count: number
    following_count: number
    verifications: string[]
    verified_addresses: VerifiedAddresses2
    active_status: string
    power_badge: boolean
    viewer_context: ViewerContext3
}

export interface Profile2 {
    bio: Bio2
}

export interface Bio2 {
    text: string
}

export interface VerifiedAddresses2 {
    eth_addresses: string[]
    sol_addresses: string[]
}

export interface ViewerContext3 {
    following: boolean
    followed_by: boolean
}

export interface Embed2 {
    url: string
}

export interface Reactions2 {
    likes_count: number
    recasts_count: number
    likes: Like2[]
    recasts: any[]
}

export interface Like2 {
    fid: number
    fname: string
}

export interface Replies2 {
    count: number
}

export interface Channel2 {
    object: string
    id: string
    name: string
    image_url: string
}

export interface MentionedProfile {
    object: string
    fid: number
    custody_address: string
    username: string
    display_name: string
    pfp_url: string
    profile: Profile3
    follower_count: number
    following_count: number
    verifications: string[]
    verified_addresses: VerifiedAddresses3
    active_status: string
    power_badge: boolean
}

export interface Profile3 {
    bio: Bio3
}

export interface Bio3 {
    text: string
    mentioned_profiles: any[]
}

export interface VerifiedAddresses3 {
    eth_addresses: string[]
    sol_addresses: any[]
}

export interface ViewerContext4 {
    liked: boolean
    recasted: boolean
}

export interface Next {
    cursor: any
}
