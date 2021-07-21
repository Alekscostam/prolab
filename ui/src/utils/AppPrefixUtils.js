class AppPrefixUtils {
	static locationHrefUrl(url) {
		if (url === undefined || url === null) {
			return url;
		} else if (url.startsWith(process.env.REACT_APP_URL_PREFIX)) {
			return url;
		} else {
			return `${process.env.REACT_APP_URL_PREFIX}${url}`;
		}
	}
}

export default AppPrefixUtils;
