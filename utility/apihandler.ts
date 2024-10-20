import Cookies from 'universal-cookie'
import {CleanURLName} from "./util";

const POSTRegisterRoute: string = "http://localhost:8080/register";
const POSTLoginRoute: string = "http://localhost:8080/login";
const GETCategoryListRoute: string = "http://localhost:8080/api/category/list";
const GETCategoryPagesRoute: string = "http://localhost:8080/api/category/<category>";
const GETPageRoute: string = "http://localhost:8080/api/page/<page>";
const GETPageCategoryRoute: string = "http://localhost:8080/api/page/<page>/<category>";
const GETPageHistoryRoute: string = "http://localhost:8080/api/pagehistory/<page>";
const GETPageHistoryByCategoryRoute: string = "http://localhost:8080/api/pagehistory/<page>/<category>";
const GETPageHistoryContentRoute: string = "http://localhost:8080/api/pagehistory/<page>/<category>/";
const POSTPageContentRoute: string = "http://localhost:8080/api/page/content";
const POSTPageUpdateRoute: string = "http://localhost:8080/api/page/update";
const POSTCategoryCreateRoute: string = "http://localhost:8080/api/category/create";

const CategoryMatch: string = "<category>";
const PageMatch: string = "<page>";

function isResponseMsg(obj: any): obj is ResponseMsg {
    return 'result' in obj;
}

export abstract class API {
    public static AuthUser?: string;
    private static cookies = new Cookies();

    private static Headers(): HeadersInit {
        const headers: HeadersInit = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Access-Control-Allow-Origin", "true");

        if (this.Authenticated()) {
            headers.set("Authorization", this.AuthToken())
        }

        return headers;
    }

    public static SetAuthToken(auth: string) {
        this.cookies.set("auth", auth, {
            path: "/",
        });
        console.log(this.cookies.get("auth"))
    }

    public static AuthToken(): string {
        return this.cookies.get("auth");
    }

    public static Authenticated(): boolean {
        let auth = this.cookies.get("auth");
        if (!auth || auth === "") {
            return false
        }

        return true;
    }

    public static async Register(username: string, password: string): Promise<boolean> {
        let auth: UserAuth = {
            username: username,
            password: password,
        }

        let result = await fetch(POSTRegisterRoute, {
            method: "POST",
            headers: this.Headers(),
            body: JSON.stringify(auth),
        })
            .catch(err => {
                console.error(err);
                return false;
            });

        if (result === false) {
            return result;
        }

        result = result as Response;
        let response = await result.json() as ResponseMsg;
        if (response.error) {
            console.error(response.error);
            return false;
        }

        console.log(response.result);
        await this.Login(username, password);
        return true;
    }

    public static async Login(username: string, password: string): Promise<boolean> {
        let auth: UserAuth = {
            username: username,
            password: password,
        };

        let result = await fetch(POSTLoginRoute, {
            method: "POST",
            headers: this.Headers(),
            body: JSON.stringify(auth),
        })
            .catch(err => {
                console.error(err);
                return false;
            });

        if (result === false) {
            return result;
        }

        result = result as Response;
        let response = await result.json() as ResponseMsg | AuthResponse;
        if (isResponseMsg(response)) {
            console.error(response.error);
            return false;
        }
        console.log(JSON.stringify(response));

        this.SetAuthToken(response.token);
        this.AuthUser = username;

        return true;
    }

    public static Logout() {
        this.cookies.remove("auth");
        this.AuthUser = undefined;
    }

    public static async GetCategories(): Promise<Category[] | null> {
        let result = await fetch(GETCategoryListRoute, {
            method: "GET",
            headers: this.Headers(),
        })
            .catch(err => {
                console.error(err);
                return null;
            });

        if (result === null) {
            return null;
        }

        result = result as Response;
        let response = await result.json() as ResponseMsg | Category[];
        if (isResponseMsg(response)) {
            console.error(response.error);
            return null;
        }

        return response;
    }

    public static async GetPagesForCategory(category: string): Promise<Page[] | null> {
        let route = GETCategoryPagesRoute.replace(CategoryMatch, CleanURLName(category));
        let result = await fetch(route, {
            method: "GET",
            headers: this.Headers(),
        })
            .catch(err => {
                console.error(err);
                return null;
            });

        if (result === null) {
            return null;
        }

        result = result as Response;
        let response = await result.json() as ResponseMsg | Page[];
        if (isResponseMsg(response)) {
            console.error(response.error);
            return null;
        }

        return response;
    }

    public static async GetPageByName(name: string): Promise<Page[] | null> {
        let route = GETPageRoute.replace(PageMatch, CleanURLName(name));
        let result = await fetch(route, {
            method: "GET",
            headers: this.Headers(),
        })
            .catch(err => {
                console.error(err);
                return null;
            });

        if (result === null) {
            return null;
        }

        result = result as Response;
        let response = await result.json() as ResponseMsg | Page[];
        if (isResponseMsg(response)) {
            console.error(response.error);
            return null;
        }

        return response;
    }

    public static async GetPageByNameAndCategory(page: string, category: string): Promise<Page | null> {
        let route = GETPageCategoryRoute
            .replace(PageMatch, CleanURLName(page))
            .replace(CategoryMatch, CleanURLName(category));

        let result = await fetch(route, {
            method: "GET",
            headers: this.Headers(),
        })
            .catch(err => {
                console.error(err);
                return null;
            });

        if (result === null) {
            return null;
        }

        result = result as Response;
        let response = await result.json() as ResponseMsg | Page;
        if (isResponseMsg(response)) {
            console.error(response.error);
            return null;
        }

        return response;
    }

    public static async GetPageContent(id: number): Promise<PageContent | null> {
        let pageID: PageID = {
            id: id,
        }

        let result = await fetch(POSTPageContentRoute, {
            method: "POST",
            headers: this.Headers(),
            body: JSON.stringify(pageID),
        })
            .catch(err => {
                console.error(err);
                return null;
            });

        if (result === null) {
            return null;
        }

        result = result as Response;
        let response = await result.json() as ResponseMsg | PageContent;
        if (isResponseMsg(response)) {
            console.error(response.error);
            return null;
        }

        return response;
    }

    public static async UpdatePage(name: string, content: string, categoryID: number, id?: number): Promise<ResponseMsg | null> {
        let updateForm: PageForm = {
            id: id,
            categoryID: categoryID,
            name: name,
            content: content,
        };

        let result = await fetch(POSTPageUpdateRoute, {
            method: "POST",
            headers: this.Headers(),
            body: JSON.stringify(updateForm),
        })
            .catch(err => {
                console.error(err);
                return null;
            })

        if (result === null) {
            return null;
        }

        let response = await result.json() as ResponseMsg;
        if (response.error) {
            console.error(response.error);
            return response;
        }

        if (!response?.page) {
            console.error("no page returned");
            return response;
        }

        return response;
    }

    public static async CreateCategory(name: string): Promise<ResponseMsg | null> {
        let category: Category = {
            name: name,
        };

        let result = await fetch(POSTCategoryCreateRoute, {
            method: "POST",
            headers: this.Headers(),
            body: JSON.stringify(category),
        })
            .catch(err => {
                console.error(err);
                return false;
            });

        if (!result) {
            return null
        }

        result = result as Response;
        return await result.json() as ResponseMsg;
    }

    public static async GetPageHistory(pageName: string, categoryName?: string): Promise<PageContent[] | null> {
        let route = "";
        if (categoryName) {
            route = GETPageHistoryByCategoryRoute.replace(CategoryMatch, categoryName).replace(PageMatch, pageName);
        } else {
            route = GETPageHistoryRoute.replace(PageMatch, pageName);
        }

        let result = await fetch(route, {
            method: "GET",
            headers: this.Headers(),
        })
            .catch(err => {
                console.error(err);
                return null;
            });

        if (!result) {
            return null;
        }

        let response = await result.json() as ResponseMsg | PageContent[];
        if (isResponseMsg(response)) {
            console.error(response.error);
            return null;
        }

        return response;
    }

    public static async GetPageHistoryContent(pageName: string, categoryName: string, version: number): Promise<PageContent | null> {
        let route = GETPageHistoryContentRoute.replace(PageMatch, pageName).replace(CategoryMatch, categoryName) + version;

        let result = await fetch(route, {
            method: "GET",
            headers: this.Headers(),
        })
            .catch(err => {
                console.error(err);
                return null;
            });

        if (!result) {
            return null;
        }

        let response = await result.json() as ResponseMsg | PageContent;
        if (isResponseMsg(response)) {
            console.error(response.error);
            return null;
        }

        return response;
    }
}

export interface UserAuth {
    username: string;
    password: string;
}

export interface Page {
    id: number;
    categoryID: number;
    categoryName: string;
    name: string;
    searchName: string;
    catSearchName: string;
}

export interface ResponseMsg {
    result?: string;
    error?: string;
    page?: Page;
}

export interface Category {
    id?: number;
    name: string;
    selected?: boolean;
}

export interface PageContent {
    pageID: number;
    name: string;
    searchName: string;
    catSearchName: string;
    categoryID: number;
    version: number;
    content: string;
    editedBy: number;
    username: string;
    dateModified: Date;
}

export interface WikiPage {
    content?: PageContent;
    Pages?: Page[];
}

export interface PageForm {
    id?: number;
    name: string;
    content: string;
    categoryID: number;
}

export interface PageID {
    id: number;
}

export interface AuthResponse {
    token: string;
}