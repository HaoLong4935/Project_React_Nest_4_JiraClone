import { Models } from "node-appwrite"
//Models.Document la them vao nhung truong cua node-appwrite vao doi tuong
// Va $ la mo rong no them nhung truong cua Model Workspace
export type Workspace = Models.Document & {
    name: string,
    userId: string,
    imageUrl: string,
    inviteCode: string,
}