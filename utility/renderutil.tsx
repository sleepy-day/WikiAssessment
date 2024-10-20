import React from 'react';
import {Category, Page, PageContent} from "./apihandler";
import {Link} from "react-router-dom";
import {CleanURLName} from "./util";

export function RenderCategoryOption(category: Category | null, selectedID?: number): React.JSX.Element {
    return <option key={category?.id} value={category?.id}>{category?.name}</option>
}

export function RenderPageSelection(pages: Page[]): React.JSX.Element {
    if (!pages.length) {
        return <div>No Page Found</div>
    }

    return (
        <div>
            {pages.map((page) => (PageLink(page)))}
        </div>
    )
}

export function RenderPageContent(content: PageContent, page: Page, history: boolean): React.JSX.Element {
    return (
        <div>
            {history ? <Link to={"/wiki/"+content.searchName+"/"+content.catSearchName}>Back</Link> :
                <Link to={"/edit/page/"+content.pageID}>Edit</Link>}
            <span> </span>
            <Link to={"/pagehistory/"+content.searchName+"/"+content.catSearchName}>
                History
            </Link>
            <h1>{page.name}</h1>
            <h3>Category: {page.categoryName}</h3>
            <div dangerouslySetInnerHTML={{__html: content.content}}></div>
        </div>
    )
}

export function RenderPageError(): React.JSX.Element {
    return <div>
        <h1>There was an error loading this page</h1>
        <p>Please try again</p>
    </div>
}

export function RenderWikiPage(errored: boolean, pageCount: number, pages: Page[] | null, content: PageContent | null, history: boolean): React.JSX.Element {
    if (errored) {
        return RenderPageError();
    }

    if (pageCount === 0) {
        return RenderPageNotFound();
    }

    if (content && pages) {
        return RenderPageContent(content, pages[0], history);
    }

    if (pages) {
        return RenderPageSelection(pages);
    }

    return pageCount >= 0 ? <div></div> : RenderPageError();
}

export function RenderCategoryPage(notFound: boolean, pages: Page[] | null): React.JSX.Element {
    if (notFound) {
        return RenderPageNotFound();
    }

    if (pages) {
        return RenderPageSelection(pages);
    }

    return <div></div>
}

export function RenderPageNotFound(): React.JSX.Element {
    return <h1>No page found</h1>
}

function PageLink(page: Page): React.JSX.Element {
    return <div><a
        key={page.id}
        href={"/wiki/"+page.searchName+"/"+page.catSearchName}
    >{page.name} - {page.categoryName}</a></div>
}

function RenderVersionLink(version: PageContent): React.JSX.Element {
    return <div>
        <Link key={version.version} to={"/pagehistory/"+version.searchName+"/"+version.catSearchName+"/"+version.version}>
            Version {version.version} - {version.name} - {version.catSearchName}
        </Link>
    </div>
}

export function RenderVersionLinks(versions: PageContent[]): React.JSX.Element {
    return <div>
        {versions.map((ver) => (RenderVersionLink(ver)))}
    </div>
}
