export type ContentType = "TEXT" | "IMAGE"
export type ItemType = "VIDEO" | "PLAYLIST" | "GROUP"

export interface Content {
  id: number
  type: ContentType
  textContent: string | null
  resourceKey: string | null
  orderNumber: number | null
}

export interface Video {
  id: number
  orderNumber: number
  name: string
  url: string | null
  expirationDate: string
  type: "VIDEO"
  coverImageUrl: string | null
  contents: Content[]
}

export interface Playlist {
  id: number
  name: string
  expirationDate: string
  type: "PLAYLIST"
  videos: Video[]
}

export interface Group {
  id: number
  name: string
  expirationDate: string
  type: "GROUP"
  playlists: Playlist[]
  videos: Video[]
}

export type Item = Group | Playlist | Video

export interface UserResponse {
  id: number
  login: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  designedName: string
  imageUrl: string | null
  activated: boolean
  langKey: string
  authorities: string[]
  createdDate: string
  lastModifiedDate: string
  passwordReset: boolean
}

export interface TagsItem {
  id: number
  name: string
  description?: string
}
 export interface ApiResponse {
  groups: {
    content: {
      id: number
      name: string
      playlists: {
        id: number
        title: string
        videos: {
          orderNumber: number
          id: number
          title: string
          url: string | null
          coverImgUrl: string | null
          contents: {
            id: number
            type: "TEXT" | "IMAGE"
            textContent: string | null
            resourceKey: string | null
            orderNumber: number | null
          }[]
        }[]
      }[]
      videos: {
        orderNumber: number
        id: number
        title: string
        url: string | null
        coverImgUrl: string | null
        contents: {
          id: number
          type: "TEXT" | "IMAGE"
          textContent: string | null
          resourceKey: string | null
          orderNumber: number | null
        }[]
      }[]
    }
    expirationDate: string
    type: "GROUP"
  }[]
  playlists: {
    content: {
      id: number
      title: string
      videos: {
        orderNumber: any
        id: number
        title: string
        url: string | null
        coverImgUrl: string | null
        contents: {
          id: number
          type: "TEXT" | "IMAGE"
          textContent: string | null
          resourceKey: string | null
          orderNumber: number | null
        }[]
      }[]
    }
    expirationDate: string
    type: "PLAYLIST"
  }[]
  videos: {
    content: {
      orderNumber: number
      id: number
      title: string
      url: string | null
      coverImgUrl: string | null
      contents: {
        id: number
        type: "TEXT" | "IMAGE"
        textContent: string | null
        resourceKey: string | null
        orderNumber: number | null
      }[]
    }
    expirationDate: string
    type: "VIDEO"
  }[]
}
