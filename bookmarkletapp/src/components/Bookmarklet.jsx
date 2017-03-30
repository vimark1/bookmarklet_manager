import React from 'react';

const buildHref = (source) => (
	`javascript:void(()=>{${source}})()`
);

const handleClick = (e) => {
	e.preventDefault();
};

const Bookmarklet = ({ source, children }) => (
	<a
		className="bookmarklet"
		href={ buildHref(source) }
		onClick={ handleClick }
	>
		{ children }
	</a>
);

export default Bookmarklet;
