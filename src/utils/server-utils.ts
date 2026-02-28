import "server-only";

export const ServerSideFunction = () => {
    console.log(
        'use multiple libraries, use enviroment variables, interact with a database, proccess confidential information'
    );
    return "server result";
};