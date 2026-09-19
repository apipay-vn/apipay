import {common} from './common';
import {home} from './home';
import {glossary} from './glossary';
import {banks, getAttachments, getFlow, getNotes} from './banks';

export const vi = {
	common,
	home,
	glossary,
	banks,
	getFlow,
	getNotes,
	getAttachments,
};

export type Content = typeof vi;
