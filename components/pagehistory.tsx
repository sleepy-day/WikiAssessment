import React from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {API, PageContent} from "../utility/apihandler";
import {RenderVersionLinks} from "../utility/renderutil";

const HistoryPage = () => {
    const navigate = useNavigate();
    const { pageName, categoryName } = useParams();
    const [versions, setVersions] = useState<PageContent[] | null>();
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function getVersions() {
            if (!API.Authenticated()) {
                navigate("/");
                return;
            }

            if (!pageName || !categoryName) {
                navigate("/");
                return;
            }

            let pageVersions = await API.GetPageHistory(pageName, categoryName);
            if (!pageVersions) {
                setNotFound(true);
                return;
            }

            setVersions(pageVersions);
        }

        getVersions();
    }, [])

    if (versions) {
        return RenderVersionLinks(versions);
    } else if (notFound) {
        return <div>Page Not Found</div>
    }

    return <div></div>
}

export default HistoryPage;