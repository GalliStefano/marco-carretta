
// const Swiper = require('swiper/swiper-bundle');

document.addEventListener("DOMContentLoaded", function() {
	// JS MAIN - Start

	function handleDarkmode() {
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		let darkModeOn = darkModeMediaQuery.matches;
		const favicon = document.querySelector('link[rel="icon"]');
		if (!favicon) return; 
		if (darkModeOn) {
			console.log('dark mode');
			favicon.href = '/images/favicon-white.svg';
		} else {
			console.log('light mode');
			favicon.href = '/images/favicon-black.svg';
		}
	}

	darkModeMediaQuery.addEventListener('change', handleDarkmode);

	// JS MAIN - End
});


