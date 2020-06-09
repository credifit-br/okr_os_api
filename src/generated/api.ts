import { BaseApiConfig, Context, SdkgenError } from "@sdkgen/node-runtime";

export interface Objective {
    id: string
    title: string
    description: string
}

export interface User {
    id: string
    name: string
    email: string
}

export class InvalidArgument extends SdkgenError {}

export class Fatal extends SdkgenError {}

export class ApiConfig<ExtraContextT> extends BaseApiConfig<ExtraContextT> {
    fn!: {
        getObjectives: (ctx: Context & ExtraContextT, args: {}) => Promise<Objective[]>
        getUsers: (ctx: Context & ExtraContextT, args: {}) => Promise<User[]>
        createUser: (ctx: Context & ExtraContextT, args: {name: string, email: string}) => Promise<User>
    }

    err = {
        InvalidArgument(message: string = "") { throw new InvalidArgument(message); },
        Fatal(message: string = "") { throw new Fatal(message); }
    }

    astJson = {
        typeTable: {
            Objective: {
                id: "uuid",
                title: "string",
                description: "string"
            },
            User: {
                id: "uuid",
                name: "string",
                email: "string"
            }
        },
        functionTable: {
            getObjectives: {
                args: {},
                ret: "Objective[]"
            },
            getUsers: {
                args: {},
                ret: "User[]"
            },
            createUser: {
                args: {
                    name: "string",
                    email: "string"
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
