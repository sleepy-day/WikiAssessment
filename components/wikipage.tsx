import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {API, Page, PageContent} from "../utility/apihandler";
import {RenderWikiPage} from "../utility/renderutil";



const WikiPage = ({catSpecified, history}: {catSpecified: boolean, history: boolean}) => {
    const navigate = useNavigate();
    const { pageName, categoryName, version } = useParams();

    const [pageCount, setPageCount] = useState(-1);
    const [pages, setPages] = useState<Page[] | null>(null);
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [errored, setErrored] = useState(false);

    useEffect(() => {
        async function getPage() {
            if (!API.Authenticated()) {
                navigate("/login");
                return;
            }

            if (!pageName) {
                navigate("/");
                return;
            }

            let retPages = await API.GetPageByName(pageName)
            if (!retPages) {
                setPageCount(0);
                return;
            }

            setPages(retPages);
            setPageCount(retPages.length);

            if (retPages.length === 1) {
                let content = await API.GetPageContent(retPages[0].id);
                if (!content) {

                    setErrored(true);
                    return;
                }
                setPageContent(content);
            }
        }

        async function getPageWithCategory() {
            if (!API.Authenticated()) {
                navigate("/login");
                return;
            }

            if (!pageName || !categoryName) {
                navigate("/");
                return;
            }

            let page = await API.GetPageByNameAndCategory(pageName, categoryName);
            if (!page) {
                setPages(null);
                setPageCount(0);
                return;
            }

            setPages([page]);
            setPageCount(1);

            let content = await API.GetPageContent(page.id);
            if (!content) {
                setErrored(true);
                return;
            }

            setPageContent(content);
        }

        async function getPageVersion() {
            if (!API.Authenticated()) {
                navigate("/login");
                return;
            }

            if (!pageName || !categoryName || !version || !Number(version)) {
                navigate("/");
                return;
            }

            let page = await API.GetPageByNameAndCategory(pageName, categoryName);
            if (!page) {
                setPages(null);
                setPageCount(0);
                return;
            }

            let content = await API.GetPageHistoryContent(pageName, categoryName, Number(version));
            if (!content) {
                setErrored(true);
                return;
            }

            setPages([page]);
            setPageCount(1);
            setPageContent(content);
        }

        if (catSpecified) {
            getPageWithCategory();
        } else if (history) {
            getPageVersion();
        } else {
            getPage();
        }
    }, [])

    return RenderWikiPage(errored, pageCount, pages, pageContent, history)
}

export default WikiPage;