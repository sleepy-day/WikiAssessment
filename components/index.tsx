import React, {useEffect, useState} from 'react';
import {API, Category} from "../utility/apihandler";
import {Link, useNavigate} from "react-router-dom";

function RenderCategoryLinks(categories: Category[]): React.JSX.Element {
    return <div>
        {categories.map((cat) => (RenderCategoryLink(cat)))}
    </div>
}

function RenderCategoryLink(category: Category): React.JSX.Element {
    return <div><Link to={"/category/"+category.name}>{category.name}</Link></div>
}

const IndexPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [categoryFormName, setCategoryFormName] = useState('');
    const [categoryFormMsg, setCategoryFormMsg] = useState('');

    useEffect(() => {
        async function getCategories() {
            if (!API.Authenticated()) {
                navigate("/login");
                return;
            }

            setCategories(await API.GetCategories());
        }

        getCategories();
    }, [])

    function formNameOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCategoryFormName(e.target.value);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCategoryFormMsg('');

        if (categoryFormName === '') {
            setCategoryFormMsg("Enter a category name");
            return;
        }

        let result = await API.CreateCategory(categoryFormName)
        if (!result) {
            setCategoryFormMsg("Error creating category");
            return;
        }

        if (result?.error) {
            setCategoryFormMsg(result?.error)
        }

        if (result?.result) {
            setCategoryFormMsg(result?.result);
            setCategories(await API.GetCategories());
        }
    }

    return (
        <div>
            <h2>Categories</h2>
            {categories !== null ? RenderCategoryLinks(categories) : <div></div>}
            <h4>Create Category</h4>
            <form onSubmit={handleSubmit}>
                <label>
                    Category Name:
                    <input value={categoryFormName} onChange={formNameOnChange} type="text"/>
                </label>
                <button type="submit">Submit</button>
            </form>
            <p>{categoryFormMsg}</p>
        </div>
    )
}

export default IndexPage;