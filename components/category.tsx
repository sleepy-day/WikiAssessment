import React, {useEffect, useState} from 'react';
import {API, Page} from "../utility/apihandler";
import {useNavigate, useParams} from "react-router-dom";
import {RenderCategoryPage} from "../utility/renderutil";

const CategoryPage = () => {
    const navigate = useNavigate();
    const [pages, setPages] = useState<Page[] | null>(null);
    const [notFound, setNotFound] = useState(false);
    const { categoryName } = useParams();

    useEffect(() => {
        async function getPages() {
            if (!API.Authenticated()) {
                navigate("/login");
                return;
            }

            if (!categoryName) {
                setNotFound(true);
                return;
            }

            setPages(await API.GetPagesForCategory(categoryName))
        }

        getPages();
    }, [])


    return (
        <div>
            <h3>Pages</h3>
            {RenderCategoryPage(notFound, pages)}
            <br />
        </div>

    )
}

export default CategoryPage;