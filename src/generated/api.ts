import { BaseApiConfig, Context, SdkgenError } from "@sdkgen/node-runtime";

export interface Episode {
    id: number
    name: string
    season: number
}

export interface User {
    id: string
    name: string
}

export class InvalidArgument extends SdkgenError {}

export class Fatal extends SdkgenError {}

export class ApiConfig<ExtraContextT> extends BaseApiConfig<ExtraContextT> {
    fn!: {
        getEpisodes: (ctx: Context & ExtraContextT, args: {showId: number}) => Promise<Episode[]>
        getUsers: (ctx: Context & ExtraContextT, args: {}) => Promise<User[]>
        createUser: (ctx: Context & ExtraContextT, args: {name: string, age: number}) => Promise<User>
    }

    err = {
        InvalidArgument(message: string = "") { throw new InvalidArgument(message); },
        Fatal(message: string = "") { throw new Fatal(message); }
    }

    astJson = {
        typeTable: {
            Episode: {
                id: "uint",
                name: "string",
                season: "uint"
            },
            User: {
                id: "uuid",
                name: "string"
            }
        },
        functionTable: {
            getEpisodes: {
                args: {
                    showId: "uint"
                },
                ret: "Episode[]"
            },
            getUsers: {
                args: {},
                ret: "User[]"
            },
            createUser: {
                args: {
                    name: "string",
                    age: "uint"
                },
                ret: "User"
            }
        },
        errors: [
            "InvalidArgument",
            "Fatal"
        ],
        annotations: {}
    }
}

export const api = new ApiConfig<{}>();
