import { Img } from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';

let Avatar = (props) => {
	let url;

	if (props.gravatarURL) {
		url = props.gravatarURL;
	} else if (props.userID) {
		url = `https://www.gravatar.com/avatar/${props.userID}?s=200&default=identicon`;
	} else {
		return null;
	}
	return (
		<div className="avatar">
			<Img height={props.height || 28} src={url} width={props.width || 28} />
		</div>
	);
};

Avatar.propTypes = {
	gravatarURL: PropTypes.string,
	userID: PropTypes.string,
	height: PropTypes.number,
	width: PropTypes.number,
};

export default Avatar;
