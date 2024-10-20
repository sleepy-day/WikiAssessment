import React from 'react';
import EditPage from './edit';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import IndexPage from './index'
import LoginPage from "./login";

import RegisterPage from "./register";
import Layout from "./layout";
import WikiPage from "./wikipage";
import CategoryPage from "./category";
import HistoryPage from "./pagehistory";

const ReactEntry = () => {
    return <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<IndexPage />}></Route>

                    <Route path="login" element={<LoginPage logout={false} />}></Route>
                    <Route path="logout" element={<LoginPage logout={true} />}></Route>
                    <Route path="register" element={<RegisterPage />}></Route>

                    <Route path="wiki/:pageName/:categoryName" element={<WikiPage catSpecified={true} history={false} />}></Route>
                    <Route path="wiki/:pageName" element={<WikiPage catSpecified={false} history={false} />}></Route>

                    <Route path="category/:categoryName" element={<CategoryPage />}></Route>

                    <Route path="edit/page/new" element={<EditPage newPage={true} />}></Route>
                    <Route path="edit/page/:id" element={<EditPage newPage={false} />}></Route>

                    <Route path="pagehistory/:pageName/:categoryName/:version" element={<WikiPage catSpecified={false} history={true} />}></Route>
                    <Route path="pagehistory/:pageName/:categoryName" element={<HistoryPage />}></Route>
                    <Route path="pagehistory/:pageName" element={<HistoryPage />}></Route>
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
}

export default ReactEntry;
