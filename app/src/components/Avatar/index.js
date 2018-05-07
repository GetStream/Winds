import Img from 'react-image';
import PropTypes from 'prop-types';
import React from 'react';
import md5 from 'md5';

let Avatar = props => {
	if (!props || !props.children) return null;
	let avatarMD5Hash = md5(props.children);
	return (
		<div className="avatar">
			<Img
				height={props.height || 28}
				src={`https://www.gravatar.com/avatar/${avatarMD5Hash}?s=200&default=identicon`}
				width={props.width || 28}
			/>
		</div>
	);
};

Avatar.propTypes = {
	children: PropTypes.string,
	height: PropTypes.number,
	width: PropTypes.number,
};

export default Avatar;
