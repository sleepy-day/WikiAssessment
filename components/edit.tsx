import React, {useEffect, useState} from 'react'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import {BubbleMenu, EditorContent, FloatingMenu, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {API, Category, Page, ResponseMsg} from "../utility/apihandler";
import {Link, useNavigate, useParams} from "react-router-dom";
import {RenderCategoryOption} from "../utility/renderutil";
import {CleanURLName} from "../utility/util";

const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    // @ts-expect-error '''
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit.configure({
        bulletList: {
            keepMarks: true,
            keepAttributes: false,
        },
        orderedList: {
            keepMarks: true,
            keepAttributes: false,
        },
    }),
];

export function TitleInput()  {
    return (
        <input id="title-input" type='text' />
    )
}

const EditPage = ({newPage}: {newPage: boolean}) => {
    const editor = useEditor({
        extensions: extensions,
        content: "",
        onUpdate: ({ editor }: any) => {
            setContent(editor.getHTML());
        },
    });

    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(-1);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [content, setContent] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [returnURL, setReturnURL] = useState('/');
    const { id } = useParams();

    useEffect(() => {
        async function loadExistingPage() {
            if (!id) {
                return;
            }

            let page = await API.GetPageContent(Number(id));
            if (!page) {
                setErrorMsg("Unable to get page");
                return;
            }

            setCategory(page.categoryID);
            setTitle(page.name);
            setContent(page.content);
            setReturnURL("/wiki/"+page.searchName+"/"+page.catSearchName);

            if (editor) {
                console.log(page.content);
                editor.commands.setContent(page.content);
            }

            await getCategoryOptions(page.categoryID);
        }

        async function getCategoryOptions(selectedID: number) {
            let categories = await API.GetCategories();
            if (categories === null) {
                setCategories(null);
                return;
            }
            setCategories(categories);
        }

        if (newPage) {
            getCategoryOptions(0);
        } else {
            loadExistingPage();
        }
    }, [])

    function handleTitleChange(value: string) {
        if (!value) {
            return;
        }

        setTitle(value);
    }

    function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
        if (Number(e.target.value) > 0) {
            setCategory(Number(e.target.value));
        }
    }

    async function updatePage(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        setErrorMsg("");

        let result: ResponseMsg | null;
        if (id) {
            let idNum = Number(id);
            result = await API.UpdatePage(title, content, category, idNum);
        } else {
            result = await API.UpdatePage(title, content, category);
        }

        if (!result || !result.page || result.error) {
            if (result?.error) {
                setErrorMsg(result.error);
            }
            return;
        }

        navigate("/wiki/"+CleanURLName(result.page.name)+"/"+CleanURLName(result.page.categoryName));
        return;
    }

    if (!editor) {
        return null;
    }

    return (
        <div>
            <Link to={returnURL}>Cancel</Link><br />
            <label>
                Title:
                <input type="text"
                       value={!title ? '' : title}
                       onChange={e => handleTitleChange(e.target.value)}
                />
            </label>
            <select key={"category-select"} value={category} onChange={handleCategoryChange}>
                <option key={0} value={0}>Select a category</option>
                {categories?.map(c => RenderCategoryOption(c, category))}
            </select>
            <button >Cancel</button>
            <button onClick={updatePage}>Save</button>
            <p>{errorMsg}</p>
            <EditorContent style={{outlineStyle: "solid", outlineColor: "black", outlineWidth: "2px", borderRadius: "4px"}} editor={editor} />
        </div>
    )
};

export default EditPage;