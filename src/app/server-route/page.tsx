import { ServerSideFunction } from "@/utils/server-utils";
export default function ServerRoutePage() {
    const result =  ServerSideFunction() 
    return <h1>Server Route {result}</h1> ;
}