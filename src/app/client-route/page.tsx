"use client";

import { ServerSideFunction } from "@/utils/server-utils";
export default function ClientRoutePage() {
    const result = ServerSideFunction()
    return <h1>Client Route {result}</h1> ;
}