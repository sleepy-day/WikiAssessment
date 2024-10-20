import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactEntry from './components/reactEntry';

const mount = document.createElement("div");
document.body.appendChild(mount);
const root = createRoot(mount!);
root.render(<ReactEntry  />);